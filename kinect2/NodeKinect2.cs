using System.Threading.Tasks;
using Microsoft.Kinect;
using Microsoft.Kinect.Tools;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Windows;
using System.Threading;

namespace NodeKinect2
{
    public class Startup
    {
        private static NodeKinect instance;

        public async Task<object> Invoke(dynamic input)
        {
            if (instance == null)
            {
                instance = new NodeKinect(input);
            }
            return true;
        }

        public async Task<object> Open(dynamic input)
        {
            return instance.Open(input);
        }

        public async Task<object> Replay(dynamic input)
        {
            return instance.Replay(input);
        }

        public async Task<object> OpenDepthReader(dynamic input)
        {
            return instance.OpenDepthReader(input);
        }

        public async Task<object> OpenBodyReader(dynamic input)
        {
            return instance.OpenBodyReader(input);
        }

        public async Task<object> OpenColorReader(dynamic input)
        {
            return instance.OpenColorReader(input);
        }

        public async Task<object> OpenInfraredReader(dynamic input)
        {
            return instance.OpenInfraredReader(input);
        }

        public async Task<object> OpenLongExposureInfraredReader(dynamic input)
        {
            return instance.OpenLongExposureInfraredReader(input);
        }

        public async Task<object> Close(dynamic input)
        {
            return instance.Close(input);
        }
    }

    public class NodeKinect
    {
        const int LedWidth = 192;
        const int LedHeight = 320;

        private KinectSensor kinectSensor = null;

        private FrameDescription depthFrameDescription = null;
        private DepthFrameReader depthFrameReader = null;

        /// <summary>
        /// Map depth range to byte range
        /// </summary>
        private const int MapDepthToByte = 8000 / 256;
        private byte[] depthPixels = null;
        private byte[] truncatedDepthPixels = null;
        private bool processingDepthFrame = false;

        private ColorFrameReader colorFrameReader = null;
        private FrameDescription colorFrameDescription = null;
        private byte[] colorPixels = null;
        private byte[] truncatedColorPixels = null;
        private bool processingColorFrame = false;

        private InfraredFrameReader infraredFrameReader = null;
        private FrameDescription infraredFrameDescription = null;
        private byte[] infraredPixels = null;
        private byte[] truncatedInfraredPixels = null;
        private bool processingInfraredFrame = false;

        private LongExposureInfraredFrameReader longExposureInfraredFrameReader = null;
        private FrameDescription longExposureInfraredFrameDescription = null;
        private byte[] longExposureInfraredPixels = null;
        private byte[] truncatedLongExposureInfraredPixels = null;
        private bool processingLongExposureInfraredFrame = false;

        /// <summary>
        /// Maximum value (as a float) that can be returned by the InfraredFrame
        /// </summary>
        private const float InfraredSourceValueMaximum = (float)ushort.MaxValue;

        /// <summary>
        /// The value by which the infrared source data will be scaled
        /// </summary>
        private const float InfraredSourceScale = 0.75f;

        /// <summary>
        /// Smallest value to display when the infrared data is normalized
        /// </summary>
        private const float InfraredOutputValueMinimum = 0.01f;

        /// <summary>
        /// Largest value to display when the infrared data is normalized
        /// </summary>
        private const float InfraredOutputValueMaximum = 1.0f;

        private CoordinateMapper coordinateMapper = null;

        private BodyFrameReader bodyFrameReader = null;
        private Body[] bodies = null;

        private Func<object, Task<object>> logCallback;
        private Func<object, Task<object>> bodyFrameCallback;
        private Func<object, Task<object>> depthFrameCallback;
        private Func<object, Task<object>> colorFrameCallback;
        private Func<object, Task<object>> infraredFrameCallback;
        private Func<object, Task<object>> longExposureInfraredFrameCallback;

        private bool isReplaying = false;
        private String replayFilePath = null;

        public NodeKinect(dynamic input)
        {
            this.logCallback = (Func<object, Task<object>>)input.logCallback;
            this.logCallback("Created NodeKinect Instance");
        }

        public async Task<object> Open(dynamic input)
        {
            this.logCallback("Open");
            this.kinectSensor = KinectSensor.GetDefault();

            if (this.kinectSensor != null)
            {
                this.coordinateMapper = this.kinectSensor.CoordinateMapper;
                this.kinectSensor.Open();
                return true;
            }
            return false;
        }

        public void ReplayForever()
        {
            try
            {
                using (KStudioClient client = KStudio.CreateClient())
                {
                    client.ConnectToService();
                    while (true)
                    {
                        KStudioPlayback playback = client.CreatePlayback(this.replayFilePath);
                        playback.LoopCount = 0;
                        playback.Start();
                        this.isReplaying = true;
                        while (playback.State == KStudioPlaybackState.Playing)
                        {
                            Thread.Sleep(500);
                        }
                    }
                    client.DisconnectFromService();
                }
            } catch (Exception e) {
                logCallback("ReplayForever exception: " + e.Message);
            }
        }

        public async Task<object> Replay(dynamic input)
        {
            this.replayFilePath = (String)input.filePath;
            this.logCallback("Replay " + this.replayFilePath);
            ThreadStart work = this.ReplayForever;
            Thread thread = new Thread(work);
            thread.Start();
            return true;
        }

        public async Task<object> OpenDepthReader(dynamic input)
        {
            this.logCallback("OpenDepthReader");
            if (this.depthFrameReader != null)
            {
                return false;
            }
            this.depthFrameCallback = (Func<object, Task<object>>)input.depthFrameCallback;

            this.depthFrameDescription = this.kinectSensor.DepthFrameSource.FrameDescription;
            this.logCallback("depth: " + this.depthFrameDescription.Width + "x" + this.depthFrameDescription.Height);

            //depth data
            this.depthFrameReader = this.kinectSensor.DepthFrameSource.OpenReader();
            this.depthFrameReader.FrameArrived += this.DepthReader_FrameArrived;
            this.depthPixels = new byte[this.depthFrameDescription.Width * this.depthFrameDescription.Height];
            this.truncatedDepthPixels = new byte[NodeKinect.LedWidth * NodeKinect.LedHeight];
            return true;
        }

        public async Task<object> OpenColorReader(dynamic input)
        {
            this.logCallback("OpenColorReader");
            if (this.colorFrameReader != null)
            {
                return false;
            }
            this.colorFrameCallback = (Func<object, Task<object>>)input.colorFrameCallback;

            this.colorFrameDescription = this.kinectSensor.ColorFrameSource.CreateFrameDescription(ColorImageFormat.Rgba);
            this.logCallback("color: " + this.colorFrameDescription.Width + "x" + this.colorFrameDescription.Height);

            this.colorFrameReader = this.kinectSensor.ColorFrameSource.OpenReader();
            this.colorFrameReader.FrameArrived += this.ColorReader_ColorFrameArrived;
            this.colorPixels = new byte[4 * this.colorFrameDescription.Width * this.colorFrameDescription.Height];
            this.truncatedColorPixels = new byte[4 * NodeKinect.LedWidth * NodeKinect.LedHeight];

            return true;
        }

        public async Task<object> OpenInfraredReader(dynamic input)
        {
            this.logCallback("OpenInfraredReader");
            if (this.infraredFrameReader != null)
            {
                return false;
            }
            this.infraredFrameCallback = (Func<object, Task<object>>)input.infraredFrameCallback;

            this.infraredFrameDescription = this.kinectSensor.InfraredFrameSource.FrameDescription;
            this.logCallback("infrared: " + this.infraredFrameDescription.Width + "x" + this.infraredFrameDescription.Height);

            //depth data
            this.infraredFrameReader = this.kinectSensor.InfraredFrameSource.OpenReader();
            this.infraredFrameReader.FrameArrived += this.InfraredReader_FrameArrived;
            this.infraredPixels = new byte[this.infraredFrameDescription.Width * this.infraredFrameDescription.Height];
            this.truncatedInfraredPixels = new byte[NodeKinect.LedWidth * NodeKinect.LedHeight];
            return true;
        }

        public async Task<object> OpenLongExposureInfraredReader(dynamic input)
        {
            this.logCallback("OpenLongExposureInfraredReader");
            if (this.longExposureInfraredFrameReader != null)
            {
                return false;
            }
            this.longExposureInfraredFrameCallback = (Func<object, Task<object>>)input.longExposureInfraredFrameCallback;

            this.longExposureInfraredFrameDescription = this.kinectSensor.LongExposureInfraredFrameSource.FrameDescription;
            this.logCallback("longExposureInfrared: " + this.longExposureInfraredFrameDescription.Width + "x" + this.longExposureInfraredFrameDescription.Height);

            //depth data
            this.longExposureInfraredFrameReader = this.kinectSensor.LongExposureInfraredFrameSource.OpenReader();
            this.longExposureInfraredFrameReader.FrameArrived += this.LongExposureInfraredReader_FrameArrived;
            this.longExposureInfraredPixels = new byte[this.longExposureInfraredFrameDescription.Width * this.longExposureInfraredFrameDescription.Height];
            this.truncatedLongExposureInfraredPixels = new byte[NodeKinect.LedWidth * NodeKinect.LedHeight];
            return true;
        }

        public async Task<object> OpenBodyReader(dynamic input)
        {
            this.logCallback("OpenBodyReader");
            if (this.bodyFrameReader != null)
            {
                return false;
            }
            this.bodyFrameCallback = (Func<object, Task<object>>)input.bodyFrameCallback;
            this.bodies = new Body[this.kinectSensor.BodyFrameSource.BodyCount];
            this.bodyFrameReader = this.kinectSensor.BodyFrameSource.OpenReader();
            this.bodyFrameReader.FrameArrived += this.BodyReader_FrameArrived;
            return true;
        }

        public async Task<object> Close(object input)
        {
            if (this.depthFrameReader != null)
            {
                this.depthFrameReader.Dispose();
                this.depthFrameReader = null;
            }

            if (this.colorFrameReader != null)
            {
                this.colorFrameReader.Dispose();
                this.colorFrameReader = null;
            }

            if (this.infraredFrameReader != null)
            {
                this.infraredFrameReader.Dispose();
                this.infraredFrameReader = null;
            }

            if (this.longExposureInfraredFrameReader != null)
            {
                this.longExposureInfraredFrameReader.Dispose();
                this.longExposureInfraredFrameReader = null;
            }

            if (this.bodyFrameReader != null)
            {
                this.bodyFrameReader.Dispose();
                this.bodyFrameReader = null;
            }

            if (this.kinectSensor != null)
            {
                this.kinectSensor.Close();
                this.kinectSensor = null;
            }
            return true;
        }

        // given a 512x424 buffer, resize to LED dimensions
        private void Rescale(byte[] originalBuffer, byte[] outBuffer)
        {
            // if we downscale 512x424 3x, the resulting resolution is
            // 170.66x141.33 -- this 'covers' 640x360 (3.75x, 2.55y).
            var downscaledX = 171;
            var downscaledY = 142;
            var outExtents = downscaledX * downscaledY;
            var downscaled = new byte[outExtents];
            var originalBufferWidth = 512; // hard coded for now
            try
            {
                var y2 = 0;
                var compression = 3;
                for(var y = 0; y < downscaledY * compression; y += compression) {
                    var x2 = 0;
                    for(var x = 0; x < (downscaledX * compression); x += compression) {
                        var i = (y * originalBufferWidth + x);
                        var j = (y2 * downscaledX + x2);
                        if(i >= originalBuffer.Length || j >= outExtents)
                        {
                            continue;
                        }
                        // NB. averaging looks ugly. do not do this.
                        downscaled[j+0] = originalBuffer[i+0];
                        // outBuffer[j+0] = originalBuffer[i+0];
                        x2++;
                    }
                    y2++;
                }
            }
            catch (Exception exc)
            {
                this.logCallback("Rescale exception (downsizing): " + exc.Message);
            }

            // now that we have a downscaled buffer, we want to
            // 'truncate' to the equivalent of 192x320. the result is
            // a 52x126 buffer.
            var realX = 52;
            var realY = 126;
            var offsetWidth = 60;
            var offsetHeight = 0;
            var maxExtents = NodeKinect.LedHeight * NodeKinect.LedWidth;
            var line = 0;
            try
            {
                for(var j=0; j<realY; j++)
                {
                    // 2,3,2,3,2,3,2,3... for height
                    var extraH = (j%2)==0 ? 2 : 3;
                    for(var m=0; m<extraH; m++)
                    {
                        var index = line * NodeKinect.LedWidth;
                        var obi = (j * downscaledX) + offsetWidth;
                        for(var i=0; i<realX; i++)
                        {
                            // 3,4,4,4,3,4,4,4... for width
                            var extraW = (i%4)==0 ? 3 : 4;
                            for(var n=0; n<extraW; n++)
                            {
                                if(index >= maxExtents)
                                {
                                    // we may be slightly over due to uneven sampling.
                                    continue;
                                }
                                outBuffer[index+0] = downscaled[obi+0];
                                index++;
                            }
                            obi++;
                        }
                        line++;
                    }
                }
            }
            catch (Exception exc2)
            {
                this.logCallback("Rescale exception (truncating): " + exc2.Message);
            }
        }

        private void DepthReader_FrameArrived(object sender, DepthFrameArrivedEventArgs e)
        {
            if (this.processingDepthFrame)
            {
                return;
            }
            this.processingDepthFrame = true;
            bool depthFrameProcessed = false;

            using (DepthFrame depthFrame = e.FrameReference.AcquireFrame())
            {
                if (depthFrame != null)
                {
                    // the fastest way to process the body index data is to directly access
                    // the underlying buffer
                    using (Microsoft.Kinect.KinectBuffer depthBuffer = depthFrame.LockImageBuffer())
                    {
                        // verify data and write the color data to the display bitmap
                        if (((this.depthFrameDescription.Width * this.depthFrameDescription.Height) == (depthBuffer.Size / this.depthFrameDescription.BytesPerPixel)))
                        {
                            // Note: In order to see the full range of depth (including the less reliable far field depth)
                            // we are setting maxDepth to the extreme potential depth threshold
                            //ushort maxDepth = ushort.MaxValue;

                            // If you wish to filter by reliable depth distance, uncomment the following line:
                            ushort maxDepth = depthFrame.DepthMaxReliableDistance;

                            this.ProcessDepthFrameData(depthBuffer.UnderlyingBuffer, depthBuffer.Size, depthFrame.DepthMinReliableDistance, maxDepth);

                            depthFrameProcessed = true;
                        }
                    }
                }
            }

            if (depthFrameProcessed)
            {
                this.Rescale(this.depthPixels, this.truncatedDepthPixels);
                this.depthFrameCallback(this.truncatedDepthPixels);
                //this.RenderDepthPixels();
            }
            this.processingDepthFrame = false;
        }

        /// <summary>
        /// Directly accesses the underlying image buffer of the DepthFrame to
        /// create a displayable bitmap.
        /// This function requires the /unsafe compiler option as we make use of direct
        /// access to the native memory pointed to by the depthFrameData pointer.
        /// </summary>
        /// <param name="depthFrameData">Pointer to the DepthFrame image data</param>
        /// <param name="depthFrameDataSize">Size of the DepthFrame image data</param>
        /// <param name="minDepth">The minimum reliable depth value for the frame</param>
        /// <param name="maxDepth">The maximum reliable depth value for the frame</param>
        private unsafe void ProcessDepthFrameData(IntPtr depthFrameData, uint depthFrameDataSize, ushort minDepth, ushort maxDepth)
        {
            // depth frame data is a 16 bit value
            ushort* frameData = (ushort*)depthFrameData;

            // convert depth to a visual representation
            for (int i = 0; i < (int)(depthFrameDataSize / this.depthFrameDescription.BytesPerPixel); ++i)
            {
                // Get the depth for this pixel
                ushort depth = frameData[i];

                // To convert to a byte, we're mapping the depth value to the byte range.
                // Values outside the reliable depth range are mapped to 0 (black).
                this.depthPixels[i] = (byte)(depth >= minDepth && depth <= maxDepth ? (depth / MapDepthToByte) : 0);
            }
        }

        private void ColorReader_ColorFrameArrived(object sender, ColorFrameArrivedEventArgs e)
        {
            if (this.processingColorFrame)
            {
                return;
            }
            this.processingColorFrame = true;
            bool colorFrameProcessed = false;
            // ColorFrame is IDisposable
            using (ColorFrame colorFrame = e.FrameReference.AcquireFrame())
            {
                if (colorFrame != null)
                {
                    FrameDescription colorFrameDescription = colorFrame.FrameDescription;

                    using (KinectBuffer colorBuffer = colorFrame.LockRawImageBuffer())
                    {
                        colorFrame.CopyConvertedFrameDataToArray(this.colorPixels, ColorImageFormat.Rgba);
                        colorFrameProcessed = true;
                    }

                    // convert to LED dimensions (mostly ripped from the old js code)
                    try
                    {
                        var y2 = 0;
                        var compression = 3;
                        var offset = (((this.colorFrameDescription.Width / compression) - NodeKinect.LedWidth) / 2) * compression;
                        for(var y = 0; y < NodeKinect.LedHeight * compression; y += compression) {
                            var x2 = 0;
                            for(var x = offset; x < (NodeKinect.LedWidth * compression) + offset; x += compression) {
                                var i = 4 * (y * this.colorFrameDescription.Width + x);
                                var j = 4 * (y2 * NodeKinect.LedWidth + x2);
                                this.truncatedColorPixels[j+0] = this.colorPixels[i+0];
                                this.truncatedColorPixels[j+1] = this.colorPixels[i+1];
                                this.truncatedColorPixels[j+2] = this.colorPixels[i+2];
                                this.truncatedColorPixels[j+3] = this.colorPixels[i+3];
                                x2++;
                            }
                            y2++;
                        }
                    }
                    catch (Exception exc)
                    {
                        this.logCallback("colorFrame exception: " + exc.Message);
                    }
                }
            }
            if (colorFrameProcessed)
            {
                this.colorFrameCallback(this.truncatedColorPixels);
            }
            this.processingColorFrame = false;
        }

        private void InfraredReader_FrameArrived(object sender, InfraredFrameArrivedEventArgs e)
        {
            if (this.processingInfraredFrame)
            {
                return;
            }
            this.processingInfraredFrame = true;
            bool infraredFrameProcessed = false;

            using (InfraredFrame infraredFrame = e.FrameReference.AcquireFrame())
            {
                if (infraredFrame != null)
                {
                    // the fastest way to process the body index data is to directly access
                    // the underlying buffer
                    using (Microsoft.Kinect.KinectBuffer infraredBuffer = infraredFrame.LockImageBuffer())
                    {
                        // verify data and write the color data to the display bitmap
                        if (((this.infraredFrameDescription.Width * this.infraredFrameDescription.Height) == (infraredBuffer.Size / this.infraredFrameDescription.BytesPerPixel)))
                        {
                            this.ProcessInfraredFrameData(infraredBuffer.UnderlyingBuffer, infraredBuffer.Size, this.infraredFrameDescription.BytesPerPixel);
                            infraredFrameProcessed = true;
                        }
                    }
                }
            }

            if (infraredFrameProcessed)
            {
                this.Rescale(this.infraredPixels, this.truncatedInfraredPixels);
                this.infraredFrameCallback(this.truncatedInfraredPixels);
            }
            this.processingInfraredFrame = false;
        }

        private void LongExposureInfraredReader_FrameArrived(object sender, LongExposureInfraredFrameArrivedEventArgs e)
        {
            if (this.processingLongExposureInfraredFrame)
            {
                return;
            }
            this.processingLongExposureInfraredFrame = true;
            bool longExposureInfraredFrameProcessed = false;

            using (LongExposureInfraredFrame longExposureInfraredFrame = e.FrameReference.AcquireFrame())
            {
                if (longExposureInfraredFrame != null)
                {
                    using (Microsoft.Kinect.KinectBuffer longExposureInfraredBuffer = longExposureInfraredFrame.LockImageBuffer())
                    {
                        // verify data and write the color data to the display bitmap
                        if (((this.longExposureInfraredFrameDescription.Width * this.longExposureInfraredFrameDescription.Height) == (longExposureInfraredBuffer.Size / this.longExposureInfraredFrameDescription.BytesPerPixel)))
                        {
                            this.ProcessLongExposureInfraredFrameData(longExposureInfraredBuffer.UnderlyingBuffer, longExposureInfraredBuffer.Size, this.longExposureInfraredFrameDescription.BytesPerPixel);
                            longExposureInfraredFrameProcessed = true;
                        }
                    }
                }
            }

            if (longExposureInfraredFrameProcessed)
            {
                this.Rescale(this.longExposureInfraredPixels, this.truncatedLongExposureInfraredPixels);
                this.longExposureInfraredFrameCallback(this.truncatedLongExposureInfraredPixels);
            }
            this.processingLongExposureInfraredFrame = false;
        }

        private unsafe void ProcessInfraredFrameData(IntPtr frameData, uint frameDataSize, uint bytesPerPixel)
        {
            ushort* lframeData = (ushort*)frameData;
            int len = (int)(frameDataSize / bytesPerPixel);
            for (int i = 0; i < len; ++i)
            {
                this.infraredPixels[i] = (byte) (0xff * Math.Min(InfraredOutputValueMaximum, (((float)lframeData[i] / InfraredSourceValueMaximum * InfraredSourceScale) * (1.0f - InfraredOutputValueMinimum)) + InfraredOutputValueMinimum));
            }
        }

        private unsafe void ProcessLongExposureInfraredFrameData(IntPtr frameData, uint frameDataSize, uint bytesPerPixel)
        {
            ushort* lframeData = (ushort*)frameData;
            int len = (int)(frameDataSize / bytesPerPixel);
            for (int i = 0; i < len; ++i)
            {
                this.longExposureInfraredPixels[i] = (byte)(0xff * Math.Min(InfraredOutputValueMaximum, (((float)lframeData[i] / InfraredSourceValueMaximum * InfraredSourceScale) * (1.0f - InfraredOutputValueMinimum)) + InfraredOutputValueMinimum));
            }
        }

        private void BodyReader_FrameArrived(object sender, BodyFrameArrivedEventArgs e)
        {
            bool dataReceived = false;

            using (BodyFrame bodyFrame = e.FrameReference.AcquireFrame())
            {
                if (bodyFrame != null)
                {
                    if (this.bodies == null)
                    {
                        this.bodies = new Body[bodyFrame.BodyCount];
                    }

                    bodyFrame.GetAndRefreshBodyData(this.bodies);
                    dataReceived = true;
                }
            }

            if (dataReceived)
            {
                var jsBodies = new ArrayList();
                foreach (Body body in this.bodies)
                {
                    if (body.IsTracked)
                    {
                        IReadOnlyDictionary<JointType, Joint> joints = body.Joints;

                        // convert the joint points to depth (display) space
                        IDictionary<String, Object> jsJoints = new Dictionary<String, Object>();
                        foreach (JointType jointType in joints.Keys)
                        {
                            DepthSpacePoint depthSpacePoint = this.coordinateMapper.MapCameraPointToDepthSpace(joints[jointType].Position);
                            jsJoints[jointType.ToString()] = new
                            {
                                x = depthSpacePoint.X,
                                y = depthSpacePoint.Y
                            };
                        }
                        var jsBody = new
                        {
                            trackingId = body.TrackingId,
                            handLeftState = body.HandLeftState,
                            handRightState = body.HandRightState,
                            joints = jsJoints
                        };
                        jsBodies.Add(jsBody);
                    }
                }
                this.bodyFrameCallback(jsBodies);
            }
        }
    }
}