uniform vec2 input_resolution;
uniform float input_globalTime;
uniform sampler2D input_channel0;

const float pi = 3.14159;

mat3 xrot(float t)
{
    return mat3(1.0, 0.0, 0.0,
                0.0, cos(t), -sin(t),
                0.0, sin(t), cos(t));
}

mat3 yrot(float t)
{
    return mat3(cos(t), 0.0, -sin(t),
                0.0, 1.0, 0.0,
                sin(t), 0.0, cos(t));
}

mat3 zrot(float t)
{
    return mat3(cos(t), -sin(t), 0.0,
                sin(t), cos(t), 0.0,
                0.0, 0.0, 1.0);
}

float pshade(vec3 p)
{
    float ac = texture2D(input_channel0, vec2(p.y,p.z)).x;
    float bc = texture2D(input_channel0, vec2(p.x,p.z)).x;
    float cc = texture2D(input_channel0, vec2(p.x,p.y)).x;
    float s = ((ac + bc + cc) / 3.0) * 2.0 - 1.0;
    return s;
}

float sphere(vec3 p)
{
    vec3 q = fract(p+0.5) * 2.0 - 1.0;
    return 1.3 - length(q);
}

float map(vec3 p)
{
    return min(sphere(p), sphere(p+0.5));
}

float trace(vec3 o, vec3 r)
{
    float t = 0.0;
    for (int i = 0; i < 32; ++i) {
        vec3 p = o + r * t;
        float d = map(p);
        t += d * 0.5;
    }
    return t;
}

vec3 normal(vec3 p)
{
    vec3 o = vec3(0.01, 0.0, 0.0);
    return normalize(vec3(map(p+o.xyy) - map(p-o.xyy),
                          map(p+o.yxy) - map(p-o.yxy),
                          map(p+o.yyx) - map(p-o.yyx)));
}

vec3 campos(float time)
{
    vec3 f = vec3(0.25);
    f.z += time;
    return f;
}

float occlusion(vec3 origin, vec3 ray) {
    float delta = 0.1;
    const int samples = 16;
    float r = 0.0;
    for (int i = 1; i <= samples; ++i) {
        float t = delta * float(i);
     	vec3 pos = origin + ray * t;
        float dist = map(pos);
        float len = abs(t - dist);
        r += len * pow(2.0, -float(i));
    }
    return r;
}

vec4 surf(vec3 r, vec3 w, vec3 sn, float t)
{
    float prod = max(dot(sn,-r), 0.0);
    float off = 0.5 + 0.5 * sin(pshade(w)*pi*5.0);
    float fog = prod / (1.0 + t * t + off);
    return vec4(vec3(fog),off);
}

vec3 shade(vec3 o, vec3 r)
{
    float t = trace(o, r);
    vec3 w = o + r * t;
    vec3 sn = normal(w);

    float lit = occlusion(o, r) * 5.0;

    vec4 ac = surf(r, w, sn, t);

    vec3 from = vec3(0.7, 0.8, 0.6);
    vec3 to = vec3(1.0, 1.0, 0.1);

    float fx = 1.0 - ac.w;

    vec3 mixed = ac.xyz * mix(from, to, fx);

    vec3 fc = lit * mixed;

    return fc;
}

vec3 raydir(vec3 r, float t)
{
    return r * yrot(t) * xrot(t*2.0);
}

void main()
{
    vec2 uv = gl_FragCoord.xy / input_resolution.xy;
    uv = uv * 2.0 - 1.0;
    uv.x *= input_resolution.x / input_resolution.y;

    vec3 r = normalize(vec3(uv, 1.0 - dot(uv,uv) * 0.333));
    float ms = input_globalTime * 0.25;
    float of = 0.01;

    vec3 ao = campos(ms);
    vec3 ar = raydir(r, ms);
    vec3 ac = shade(ao, ar);

    gl_FragColor = vec4(ac, 1.0);
}
