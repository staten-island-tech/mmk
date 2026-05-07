  vec2 myTanh(vec2 x) {
    vec2 ex = exp(x); 
    vec2 emx = exp(-x);
    return (ex - emx) / (ex + emx);
  }

  vec4 getBlackHole(vec2 p, float time) {
    vec4 o_bg = vec4(0.0);
    vec4 o_anim = vec4(0.0);

    // Background Layer
    {
      vec2 p_img = p * mat2(1.0, -1.0, 1.0, 1.0);
      vec2 l_val = myTanh(p_img * 5.0 + 2.0);
      l_val = min(l_val, l_val * 3.0);
      vec2 clamped = clamp(l_val, -2.0, 0.0);
      float diff_y = clamped.y - l_val.y;
      float safe_px = abs(p_img.x) < 0.001 ? 0.001 : p_img.x;
      float term = (0.1 - max(0.01 - dot(p_img, p_img) / 200.0, 0.0) * (diff_y / safe_px))
                   / abs(length(p_img) - 0.7);
      o_bg += vec4(term);
      o_bg *= max(o_bg, vec4(0.0));
    }

    // Animation Layer
    {
      vec2 p_anim = p / 0.7;
      vec2 d = vec2(-1.0, 1.0);
      float denom = 0.1 + 5.0 / dot(5.0 * p_anim - d, 5.0 * p_anim - d);
      vec2 c = p_anim * mat2(1.0, 1.0, d.x / denom, d.y / denom);
      vec2 v = c;

      // Fixed problematic line
      float angleOffset = log(length(v)) + time * 0.2;
      v *= mat2(cos(angleOffset), -sin(angleOffset), sin(angleOffset), cos(angleOffset)) * 5.0;

      vec4 animAccum = vec4(0.0);
      for (int i = 1; i <= 9; i++) {
        float fi = float(i);
        animAccum += sin(vec4(v.x, v.y, v.y, v.x)) + vec4(1.0);
        v += 0.7 * sin(vec2(v.y, v.x) * fi + time) / fi + 0.5;
      }

      vec4 animTerm = 1.0 - exp(-exp(c.x * vec4(0.6, -0.4, -1.0, 0.0))
                        / animAccum
                        / (0.1 + 0.1 * pow(length(sin(v / 0.3) * 0.2 + c * vec2(1.0, 2.0)) - 1.0, 2.0))
                        / (1.0 + 7.0 * exp(0.3 * c.y - dot(c, c)))
                        / (0.03 + abs(length(p_anim) - 0.7)) * 0.2);
      o_anim += animTerm;
    }

    return mix(o_bg, o_anim, 0.5) * 1.8;
  }
