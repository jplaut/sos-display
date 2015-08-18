uniform vec2 input_resolution;
uniform float input_globalTime;
uniform sampler2D input_channel0;
uniform sampler2D input_channel1;

void main()
{
    vec2 p = gl_FragCoord.xy / input_resolution.xy;
    p.x += 0.18;
    p.y -= 0.9;

    vec2 uv = vec2( p.x+mod(input_globalTime, 2.0), p.y );
    float f = texture2D( input_channel1, uv ).x;
    f = f*f;
    vec3 bg = vec3(0.0,51.0/255.0,102.0/255.0);
    bg = mix( bg, vec3(1.0), f );

    float a = 0.01*sin(40.0*p.x + 8.0*input_globalTime);
    float h = (a+p.y-0.3)/(0.7-0.3);
    if( p.x<0.65 && h>0.0 && h<1.0 )
    {
        h = floor( h*6.0 );
        bg = mix( bg, vec3(1.0,0.0,0.0), 1.0 - smoothstep( 0.0, 0.1, abs(h-5.0) ) );
        bg = mix( bg, vec3(1.0,0.6,0.0), 1.0 - smoothstep( 0.0, 0.1, abs(h-4.0) ) );
        bg = mix( bg, vec3(1.0,1.0,0.0), 1.0 - smoothstep( 0.0, 0.1, abs(h-3.0) ) );
        bg = mix( bg, vec3(0.2,1.0,0.0), 1.0 - smoothstep( 0.0, 0.1, abs(h-2.0) ) );
        bg = mix( bg, vec3(0.0,0.6,1.0), 1.0 - smoothstep( 0.0, 0.1, abs(h-1.0) ) );
        bg = mix( bg, vec3(0.4,0.2,1.0), 1.0 - smoothstep( 0.0, 0.1, abs(h-0.0) ) );
    }

    uv = (p - vec2(0.5,0.15)) / (vec2(1.02,0.9) - vec2(0.5,0.15));
    uv = clamp( uv, 0.0, 1.0 );

    float ofx = floor( mod( input_globalTime*4.0, 6.0 ) );

    float ww = 40.0/256.0;
    uv.x = clamp( uv.x*ww + ofx*ww, 0.0, 1.0 );
    vec4 fg = texture2D( input_channel0, uv );

    vec3 col = mix( bg, fg.xyz, fg.w );
    gl_FragColor = vec4( col.xyz, 1.0 );
}
