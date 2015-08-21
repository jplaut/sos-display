// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
// https://www.shadertoy.com/view/MdBGDK
// By David Hoskins.
uniform vec2 input_resolution;
uniform float input_globalTime;
uniform float input_skeletons[32];

void main()
{
    float f = 3., g = 3.;
    vec2 res = input_resolution.xy;

    vec2 mou = vec2(input_skeletons[0], input_skeletons[1]);
    mou.x = sin(input_globalTime * .3)*sin(input_globalTime * .17) * 1. + sin(input_globalTime * .3);
    mou.y = (1.0-cos(input_globalTime * .632))*sin(input_globalTime * .131)*1.0+cos(input_globalTime * .3);
    mou = (mou+1.0) * res;
    vec2 z = ((-res+2.0 * gl_FragCoord.xy) / res.y);
    vec2 p = ((-res+2.0+mou) / res.y);
    for( int i = 0; i < 20; i++)
    {
        float d = dot(z,z);
        z = (vec2( z.x, -z.y ) / d) + p;
        z.x =  abs(z.x);
        f = max( f, (dot(z-p,z-p) ));
        g = min( g, sin(dot(z+p,z+p))+1.0);
    }
    f = abs(-log(f) / 3.5);
    g = abs(-log(g) / 8.0);
    gl_FragColor = vec4(min(vec3(g, g*f, f), 1.0),1.0);
}
