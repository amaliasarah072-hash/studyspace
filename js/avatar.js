/**
 * STUDYSPACE - Modular SVG Avatar Engine
 * Renders cute customizable student avatars with distinct Female and Male styles:
 * Base Body, Face, Hair/Hijab, Clothes, Glasses, Hats, Headphones, Bags.
 */

const AVATAR_PRESETS = {
  skinTones: [
    { id: 'fair', name: 'Fair Ivory', hex: '#FFE8DC', shadow: '#F5CCA0' },
    { id: 'warm', name: 'Warm Peach', hex: '#FAD8C3', shadow: '#E2B193' },
    { id: 'honey', name: 'Golden Honey', hex: '#ECC4A1', shadow: '#D29C74' },
    { id: 'tan', name: 'Almond Tan', hex: '#CF9974', shadow: '#A86C45' },
    { id: 'deep', name: 'Rich Caramel', hex: '#8B5B3E', shadow: '#613C24' }
  ],
  genders: [
    { id: 'female', name: 'Perempuan (Female) 👧' },
    { id: 'male', name: 'Laki-Laki (Male) 👦' }
  ],
  hairStyles: [
    // Female Hair & Hijab
    { id: 'hijab', name: 'Hijab / Jilbab Pelajar', gender: 'female', free: true },
    { id: 'bob', name: 'Classic Bob', gender: 'female', free: true },
    { id: 'ponytail', name: 'High Ponytail', gender: 'female', free: true },
    { id: 'wavy', name: 'Long Wavy Hair', gender: 'female', free: true },
    { id: 'bun', name: 'Messy Bun', gender: 'female', free: true },
    { id: 'twintails', name: 'Cute Twin Tails', gender: 'female', free: true },

    // Male Hair
    { id: 'short', name: 'Casual Short', gender: 'male', free: true },
    { id: 'fluffy', name: 'Fluffy Curtains', gender: 'male', free: true },
    { id: 'sidepart', name: 'Neat Side Part', gender: 'male', free: true },
    { id: 'fade', name: 'Clean Modern Fade', gender: 'male', free: true },
    { id: 'curly', name: 'Textured Curls', gender: 'male', free: true }
  ],
  hairColors: [
    { id: 'black', name: 'Espresso Black', hex: '#26242B' },
    { id: 'darkbrown', name: 'Cocoa Brown', hex: '#4A3728' },
    { id: 'caramel', name: 'Honey Brown', hex: '#8C5D35' },
    { id: 'lavender', name: 'Pastel Lilac', hex: '#9D8BC9' },
    { id: 'pink', name: 'Sakura Pink', hex: '#F4ACB7' },
    { id: 'sage', name: 'Sage Mint', hex: '#7C986F' }
  ],
  expressions: [
    { id: 'happy', name: 'Happy Sparkle ✨' },
    { id: 'focus', name: 'Deep Focus 📖' },
    { id: 'smile', name: 'Gentle Smile 😊' },
    { id: 'wink', name: 'Cute Wink 😉' }
  ],
  outfits: [
    // Female Outfits
    { id: 'cardigan', name: 'Soft Cardigan & Skirt', gender: 'female', free: true },
    { id: 'uniform_f', name: 'Academy Vest with Ribbon', gender: 'female', free: true },
    { id: 'sweater_f', name: 'Cozy Oversized Sweater', gender: 'female', free: true },
    { id: 'blouse', name: 'Sweet Peter-Pan Blouse', gender: 'female', reqLevel: 2 },

    // Male Outfits
    { id: 'hoodie_m', name: 'Relaxed Study Hoodie', gender: 'male', free: true },
    { id: 'uniform_m', name: 'Academy Vest with Tie', gender: 'male', free: true },
    { id: 'oxford', name: 'Smart Oxford Shirt', gender: 'male', free: true },
    { id: 'blazer_m', name: 'Academic Study Blazer', gender: 'male', reqLevel: 2 }
  ],
  outfitColors: [
    { id: 'lavender', name: 'Pastel Lavender', hex: '#9D8BC9', trim: '#7C69A5' },
    { id: 'sage', name: 'Sage Green', hex: '#8FA882', trim: '#6B835F' },
    { id: 'pink', name: 'Soft Rose', hex: '#F4ACB7', trim: '#D97384' },
    { id: 'cream', name: 'Warm Cream', hex: '#F5EFEB', trim: '#D6C8BA' },
    { id: 'butter', name: 'Butter Yellow', hex: '#FEE388', trim: '#E5C058' },
    { id: 'navy', name: 'Midnight Navy', hex: '#3B4861', trim: '#283144' }
  ],
  glasses: [
    { id: 'none', name: 'Tanpa Kacamata', free: true },
    { id: 'round', name: 'Round Wire Frames', free: true },
    { id: 'browline', name: 'Classic Browline', free: true },
    { id: 'cateye', name: 'Cute Cat-Eye', reqLevel: 2 }
  ],
  hats: [
    { id: 'none', name: 'Tanpa Topi', free: true },
    { id: 'beret', name: 'Artisan Beret', free: true },
    { id: 'beanie', name: 'Cozy Knit Beanie', free: true },
    { id: 'flower', name: 'Sakura Hairpin', free: true },
    { id: 'grad', name: 'Graduation Cap', reqLevel: 3 }
  ],
  headphones: [
    { id: 'none', name: 'Tanpa Headphone', free: true },
    { id: 'studio', name: 'Pastel Studio Headphones', free: true },
    { id: 'catear', name: 'Cute Cat-Ear Headphones', reqLevel: 2 }
  ],
  bags: [
    { id: 'none', name: 'Tanpa Tas', free: true },
    { id: 'tote', name: 'Canvas Book Tote Bag', free: true },
    { id: 'backpack', name: 'Academy Backpack', free: true }
  ]
};

const DEFAULT_AVATAR = {
  gender: 'female',
  skinTone: 'fair',
  hairStyle: 'hijab',
  hairColor: 'darkbrown',
  expression: 'smile',
  outfit: 'cardigan',
  outfitColor: 'lavender',
  glasses: 'round',
  hat: 'none',
  headphones: 'none',
  bag: 'tote'
};

class AvatarRenderer {
  static renderSVG(config = {}, size = 120) {
    const c = { ...DEFAULT_AVATAR, ...config };
    const skin = AVATAR_PRESETS.skinTones.find(s => s.id === c.skinTone) || AVATAR_PRESETS.skinTones[0];
    const hairCol = AVATAR_PRESETS.hairColors.find(h => h.id === c.hairColor) || AVATAR_PRESETS.hairColors[1];
    const outfitCol = AVATAR_PRESETS.outfitColors.find(o => o.id === c.outfitColor) || AVATAR_PRESETS.outfitColors[0];
    const isFemale = c.gender === 'female';

    let svg = `<svg viewBox="0 0 200 200" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" class="avatar-svg select-none">
      <defs>
        <radialGradient id="avatarGlow_${size}" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stop-color="#FDFBF7" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#EFE8DE" stop-opacity="0.5"/>
        </radialGradient>
        <filter id="softShadow_${size}" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#463864" flood-opacity="0.12"/>
        </filter>
      </defs>

      <!-- Background Circle -->
      <circle cx="100" cy="100" r="95" fill="url(#avatarGlow_${size})" />
      <circle cx="100" cy="100" r="95" fill="none" stroke="#EAE2D5" stroke-width="2" />
    `;

    // 1. BACK HAIR (for ponytail, wavy, bun, twintails)
    if (isFemale && c.hairStyle !== 'hijab') {
      if (c.hairStyle === 'ponytail') {
        svg += `
          <ellipse cx="148" cy="72" rx="16" ry="28" fill="${hairCol.hex}" transform="rotate(25 148 72)" />
          <ellipse cx="152" cy="85" rx="12" ry="24" fill="${hairCol.hex}" transform="rotate(15 152 85)" />
          <circle cx="138" cy="62" r="8" fill="#F4ACB7" />
        `;
      } else if (c.hairStyle === 'wavy') {
        svg += `
          <path d="M52 80 C 45 110, 40 145, 60 170 C 65 175, 75 160, 70 140 C 65 120, 68 95, 70 80 Z" fill="${hairCol.hex}" />
          <path d="M148 80 C 155 110, 160 145, 140 170 C 135 175, 125 160, 130 140 C 135 120, 132 95, 130 80 Z" fill="${hairCol.hex}" />
        `;
      } else if (c.hairStyle === 'bun') {
        svg += `
          <circle cx="100" cy="38" r="26" fill="${hairCol.hex}" />
          <path d="M92 56 Q 100 52 108 56" stroke="#FEE388" stroke-width="4" stroke-linecap="round" fill="none" />
        `;
      } else if (c.hairStyle === 'twintails') {
        svg += `
          <ellipse cx="50" cy="95" rx="14" ry="26" fill="${hairCol.hex}" transform="rotate(15 50 95)" />
          <circle cx="56" cy="75" r="6" fill="#F4ACB7" />
          <ellipse cx="150" cy="95" rx="14" ry="26" fill="${hairCol.hex}" transform="rotate(-15 150 95)" />
          <circle cx="144" cy="75" r="6" fill="#F4ACB7" />
        `;
      }
    }

    // 2. BACK ACCESSORIES (Backpack)
    if (c.bag === 'backpack') {
      svg += `
        <rect x="52" y="130" width="12" height="50" rx="6" fill="#6F5B9B" opacity="0.8" />
        <rect x="136" y="130" width="12" height="50" rx="6" fill="#6F5B9B" opacity="0.8" />
        <ellipse cx="155" cy="155" rx="14" ry="22" fill="#544379" />
      `;
    }

    // 3. BODY & CLOTHING BASE (Differed by Gender)
    if (isFemale) {
      // Female: Softer rounded shoulders
      svg += `
        <!-- Neck -->
        <rect x="89" y="112" width="22" height="24" rx="6" fill="${skin.shadow}" />
        <rect x="91" y="110" width="18" height="22" rx="5" fill="${skin.hex}" />
        <!-- Torso -->
        <path d="M52 195 C 52 148, 74 132, 100 132 C 126 132, 148 148, 148 195 Z" fill="${outfitCol.hex}" filter="url(#softShadow_${size})" />
      `;
    } else {
      // Male: Slightly broader shoulders
      svg += `
        <!-- Neck -->
        <rect x="87" y="112" width="26" height="24" rx="6" fill="${skin.shadow}" />
        <rect x="89" y="110" width="22" height="22" rx="5" fill="${skin.hex}" />
        <!-- Torso -->
        <path d="M46 195 C 46 144, 70 128, 100 128 C 130 128, 154 144, 154 195 Z" fill="${outfitCol.hex}" filter="url(#softShadow_${size})" />
      `;
    }

    // 4. OUTFIT DETAILS
    if (c.outfit === 'cardigan' || c.outfit === 'sweater_f') {
      // Soft Cardigan with buttons & inner shirt
      svg += `
        <polygon points="86,132 114,132 100,154" fill="#FFFFFF" />
        <path d="M84 132 L100 156 L100 195" stroke="${outfitCol.trim}" stroke-width="3" fill="none" />
        <circle cx="100" cy="164" r="2.5" fill="#FFFFFF" />
        <circle cx="100" cy="176" r="2.5" fill="#FFFFFF" />
        <circle cx="100" cy="188" r="2.5" fill="#FFFFFF" />
      `;
    } else if (c.outfit === 'uniform_f') {
      // Academy School Vest with Ribbon
      svg += `
        <polygon points="84,132 116,132 100,156" fill="#FFFFFF" />
        <polygon points="96,145 104,145 100,165" fill="#D97384" />
        <circle cx="100" cy="145" r="3.5" fill="#D97384" />
        <path d="M82 132 L98 160 L98 195" stroke="${outfitCol.trim}" stroke-width="2.5" fill="none" />
        <path d="M118 132 L102 160 L102 195" stroke="${outfitCol.trim}" stroke-width="2.5" fill="none" />
      `;
    } else if (c.outfit === 'uniform_m') {
      // Male Academy Vest with Tie
      svg += `
        <polygon points="85,128 115,128 100,154" fill="#FFFFFF" />
        <polygon points="97,140 103,140 105,165 100,170 95,165" fill="#3B4861" />
        <path d="M80 128 L96 158 L96 195" stroke="${outfitCol.trim}" stroke-width="3" fill="none" />
        <path d="M120 128 L104 158 L104 195" stroke="${outfitCol.trim}" stroke-width="3" fill="none" />
      `;
    } else if (c.outfit === 'oxford') {
      // Oxford Shirt with collar
      svg += `
        <polygon points="86,128 114,128 100,146" fill="#FFFFFF" />
        <polygon points="84,128 100,142 92,130" fill="#EAEAEA" />
        <polygon points="116,128 100,142 108,130" fill="#EAEAEA" />
        <line x1="100" y1="146" x2="100" y2="195" stroke="${outfitCol.trim}" stroke-width="2" />
        <circle cx="100" cy="160" r="2.5" fill="#FFFFFF" />
        <circle cx="100" cy="175" r="2.5" fill="#FFFFFF" />
      `;
    } else {
      // Relaxed Hoodie / Tee
      svg += `
        <path d="M80 130 Q 100 152 120 130" fill="none" stroke="${outfitCol.trim}" stroke-width="5" stroke-linecap="round" />
        <line x1="94" y1="140" x2="94" y2="162" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
        <line x1="106" y1="140" x2="106" y2="158" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
      `;
    }

    // Tote Bag overlay
    if (c.bag === 'tote') {
      svg += `
        <path d="M58 140 Q 64 165 72 195" stroke="#C8BCA8" stroke-width="4" stroke-linecap="round" fill="none" />
        <rect x="52" y="170" width="30" height="25" rx="4" fill="#EAE3D6" stroke="#C8BCA8" stroke-width="1.5" />
        <text x="67" y="185" font-size="8" font-family="sans-serif" text-anchor="middle" fill="#9D8BC9">★</text>
      `;
    }

    // 5. HEAD & FACE
    if (isFemale) {
      svg += `
        <!-- Female Ears -->
        <ellipse cx="60" cy="85" rx="7.5" ry="10" fill="${skin.hex}" />
        <ellipse cx="140" cy="85" rx="7.5" ry="10" fill="${skin.hex}" />
        <!-- Female Soft Head -->
        <ellipse cx="100" cy="82" rx="41" ry="45" fill="${skin.hex}" filter="url(#softShadow_${size})" />
        <!-- Cute Cheek Blushes -->
        <ellipse cx="73" cy="92" rx="7" ry="4" fill="#F4ACB7" opacity="0.65" />
        <ellipse cx="127" cy="92" rx="7" ry="4" fill="#F4ACB7" opacity="0.65" />
      `;
    } else {
      svg += `
        <!-- Male Ears -->
        <ellipse cx="58" cy="85" rx="8" ry="11" fill="${skin.hex}" />
        <ellipse cx="142" cy="85" rx="8" ry="11" fill="${skin.hex}" />
        <!-- Male Structured Head -->
        <ellipse cx="100" cy="81" rx="43" ry="46" fill="${skin.hex}" filter="url(#softShadow_${size})" />
      `;
    }

    // 6. FACIAL EXPRESSIONS
    if (c.expression === 'happy') {
      svg += `
        <path d="M73 78 Q 81 70 89 78" fill="none" stroke="#2D283E" stroke-width="3.2" stroke-linecap="round" />
        <path d="M111 78 Q 119 70 127 78" fill="none" stroke="#2D283E" stroke-width="3.2" stroke-linecap="round" />
        <path d="M92 94 Q 100 106 108 94 Z" fill="#D97384" />
      `;
    } else if (c.expression === 'focus') {
      svg += `
        <circle cx="81" cy="78" r="4.8" fill="#2D283E" />
        <circle cx="83" cy="76" r="1.8" fill="#FFFFFF" />
        <circle cx="119" cy="78" r="4.8" fill="#2D283E" />
        <circle cx="121" cy="76" r="1.8" fill="#FFFFFF" />
        <path d="M72 68 L 88 71" stroke="#2D283E" stroke-width="2.2" stroke-linecap="round" />
        <path d="M128 68 L 112 71" stroke="#2D283E" stroke-width="2.2" stroke-linecap="round" />
        <path d="M95 96 Q 100 99 105 96" fill="none" stroke="#2D283E" stroke-width="2.4" stroke-linecap="round" />
      `;
    } else if (c.expression === 'wink') {
      svg += `
        <circle cx="81" cy="78" r="5" fill="#2D283E" />
        <circle cx="83" cy="76" r="1.8" fill="#FFFFFF" />
        <path d="M112 79 Q 120 73 128 79" fill="none" stroke="#2D283E" stroke-width="3.2" stroke-linecap="round" />
        <path d="M93 94 Q 100 102 107 94" fill="none" stroke="#2D283E" stroke-width="2.6" stroke-linecap="round" />
      `;
    } else {
      // Gentle smile
      svg += `
        <circle cx="81" cy="78" r="4.8" fill="#2D283E" />
        <circle cx="82.5" cy="76.5" r="1.8" fill="#FFFFFF" />
        <circle cx="119" cy="78" r="4.8" fill="#2D283E" />
        <circle cx="120.5" cy="76.5" r="1.8" fill="#FFFFFF" />
        <path d="M73 69 Q 81 66 88 69" stroke="#2D283E" stroke-width="2" stroke-linecap="round" fill="none" />
        <path d="M112 69 Q 119 66 127 69" stroke="#2D283E" stroke-width="2" stroke-linecap="round" fill="none" />
        <path d="M94 95 Q 100 101 106 95" fill="none" stroke="#2D283E" stroke-width="2.5" stroke-linecap="round" />
      `;
    }
    // Tiny cute nose
    svg += `<circle cx="100" cy="87" r="1.5" fill="${skin.shadow}" />`;

    // 7. HAIR OR HIJAB LAYER
    if (isFemale && c.hairStyle === 'hijab') {
      // Cute Modest Student Hijab
      svg += `
        <!-- Hijab Frame around face -->
        <path d="M54 75 C 50 34, 150 34, 146 75 C 146 115, 136 138, 100 138 C 64 138, 54 115, 54 75 Z" fill="${hairCol.hex}" />
        <!-- Face Opening Oval cutout showing face -->
        <ellipse cx="100" cy="82" rx="36" ry="40" fill="${skin.hex}" />
        <!-- Hijab Under-cap (Ciput) band -->
        <path d="M68 62 Q 100 52 132 62" stroke="#FAF7F2" stroke-width="5" fill="none" stroke-linecap="round" />
        <!-- Re-draw facial expression over hijab inner opening -->
        ${c.expression === 'happy' ? `
          <path d="M76 78 Q 82 72 88 78" fill="none" stroke="#2D283E" stroke-width="3" stroke-linecap="round" />
          <path d="M112 78 Q 118 72 124 78" fill="none" stroke="#2D283E" stroke-width="3" stroke-linecap="round" />
          <path d="M93 94 Q 100 104 107 94 Z" fill="#D97384" />
        ` : `
          <circle cx="82" cy="78" r="4.5" fill="#2D283E" />
          <circle cx="83.5" cy="76.5" r="1.6" fill="#FFFFFF" />
          <circle cx="118" cy="78" r="4.5" fill="#2D283E" />
          <circle cx="119.5" cy="76.5" r="1.6" fill="#FFFFFF" />
          <path d="M94 95 Q 100 100 106 95" fill="none" stroke="#2D283E" stroke-width="2.4" stroke-linecap="round" />
        `}
        <ellipse cx="76" cy="92" rx="6" ry="3.5" fill="#F4ACB7" opacity="0.65" />
        <ellipse cx="124" cy="92" rx="6" ry="3.5" fill="#F4ACB7" opacity="0.65" />
        <!-- Hijab draped shoulders wrap -->
        <path d="M50 148 C 50 120, 75 110, 100 110 C 125 110, 150 120, 150 148 C 146 175, 128 185, 100 185 C 72 185, 54 175, 50 148 Z" fill="${hairCol.hex}" opacity="0.95" />
      `;
    } else if (isFemale) {
      // Female Hair options
      if (c.hairStyle === 'bob') {
        svg += `
          <path d="M56 82 C 55 50, 75 38, 100 38 C 125 38, 145 50, 144 82 C 144 100, 138 108, 134 110 C 130 90, 126 80, 120 70 C 110 65, 90 65, 80 70 C 74 80, 70 90, 66 110 C 62 108, 56 100, 56 82 Z" fill="${hairCol.hex}" />
          <path d="M68 62 Q 82 72 96 66 Q 104 72 120 62 Q 132 64 134 72 C 124 55, 76 55, 68 62 Z" fill="${hairCol.hex}" />
        `;
      } else {
        svg += `
          <path d="M58 75 C 56 46, 75 36, 100 36 C 125 36, 144 46, 142 75 C 136 62, 122 55, 100 55 C 78 55, 64 62, 58 75 Z" fill="${hairCol.hex}" />
          <path d="M70 58 Q 85 66 100 60 Q 115 66 130 58 C 122 48, 78 48, 70 58 Z" fill="${hairCol.hex}" />
        `;
      }
    } else {
      // Male Hair options
      if (c.hairStyle === 'fluffy') {
        svg += `
          <path d="M56 78 C 55 45, 75 36, 100 36 C 125 36, 145 45, 144 78 C 138 66, 126 56, 102 62 C 100 62, 100 62, 98 62 C 74 56, 62 66, 56 78 Z" fill="${hairCol.hex}" />
          <path d="M64 74 Q 80 58 98 64 Q 78 72 68 84" fill="${hairCol.hex}" />
          <path d="M136 74 Q 120 58 102 64 Q 122 72 132 84" fill="${hairCol.hex}" />
        `;
      } else if (c.hairStyle === 'fade') {
        svg += `
          <path d="M62 76 C 60 50, 76 38, 100 38 C 124 38, 140 50, 138 76 C 134 68, 128 62, 100 60 C 72 62, 66 68, 62 76 Z" fill="${hairCol.hex}" />
          <rect x="58" y="68" width="8" height="16" rx="3" fill="${hairCol.hex}" opacity="0.35" />
          <rect x="134" y="68" width="8" height="16" rx="3" fill="${hairCol.hex}" opacity="0.35" />
        `;
      } else {
        // Casual Short / Side Part
        svg += `
          <path d="M58 75 C 57 46, 74 38, 100 38 C 126 38, 143 46, 142 75 C 138 65, 130 58, 118 60 C 108 55, 92 55, 82 60 C 70 58, 62 65, 58 75 Z" fill="${hairCol.hex}" />
          <polygon points="78,44 86,34 92,44" fill="${hairCol.hex}" />
          <polygon points="94,42 104,32 110,42" fill="${hairCol.hex}" />
        `;
      }
    }

    // 8. GLASSES
    if (c.glasses === 'round') {
      svg += `
        <circle cx="80" cy="78" r="14" fill="none" stroke="#B8A7E0" stroke-width="2.5" />
        <circle cx="120" cy="78" r="14" fill="none" stroke="#B8A7E0" stroke-width="2.5" />
        <line x1="94" y1="78" x2="106" y2="78" stroke="#B8A7E0" stroke-width="2.5" />
      `;
    } else if (c.glasses === 'browline') {
      svg += `
        <rect x="68" y="68" width="25" height="18" rx="4" fill="none" stroke="#4A3728" stroke-width="2" />
        <rect x="107" y="68" width="25" height="18" rx="4" fill="none" stroke="#4A3728" stroke-width="2" />
        <line x1="68" y1="69" x2="93" y2="69" stroke="#4A3728" stroke-width="4" stroke-linecap="round" />
        <line x1="107" y1="69" x2="132" y2="69" stroke="#4A3728" stroke-width="4" stroke-linecap="round" />
        <line x1="93" y1="72" x2="107" y2="72" stroke="#4A3728" stroke-width="2" />
      `;
    } else if (c.glasses === 'cateye') {
      svg += `
        <path d="M66 74 Q 80 88 94 74 Q 80 66 66 74 Z" fill="none" stroke="#F4ACB7" stroke-width="3" />
        <path d="M106 74 Q 120 88 134 74 Q 120 66 106 74 Z" fill="none" stroke="#F4ACB7" stroke-width="3" />
        <line x1="94" y1="73" x2="106" y2="73" stroke="#F4ACB7" stroke-width="2.5" />
      `;
    }

    // 9. HATS & HAIR ACCESORIES
    if (c.hat === 'beret') {
      svg += `
        <ellipse cx="106" cy="42" rx="46" ry="18" fill="#D97384" transform="rotate(-8 106 42)" />
        <circle cx="107" cy="19" r="2.5" fill="#D97384" />
      `;
    } else if (c.hat === 'beanie') {
      svg += `
        <path d="M62 55 C 62 25, 138 25, 138 55 Z" fill="#8FA882" />
        <rect x="60" y="48" width="80" height="12" rx="4" fill="#6B835F" />
      `;
    } else if (c.hat === 'flower') {
      svg += `
        <g transform="translate(66, 52)">
          <circle cx="0" cy="-5" r="3.5" fill="#FCEEF0" />
          <circle cx="5" cy="0" r="3.5" fill="#FCEEF0" />
          <circle cx="0" cy="5" r="3.5" fill="#FCEEF0" />
          <circle cx="-5" cy="0" r="3.5" fill="#FCEEF0" />
          <circle cx="0" cy="0" r="3" fill="#FEE388" />
        </g>
      `;
    } else if (c.hat === 'grad') {
      svg += `
        <polygon points="100,20 148,32 100,44 52,32" fill="#363A45" />
        <rect x="80" y="38" width="40" height="12" rx="2" fill="#242730" />
        <circle cx="100" cy="32" r="3" fill="#FEE388" />
      `;
    }

    // 10. HEADPHONES
    if (c.headphones === 'studio') {
      svg += `
        <path d="M54 75 C 50 30, 150 30, 146 75" fill="none" stroke="#9D8BC9" stroke-width="6" stroke-linecap="round" />
        <rect x="48" y="70" width="10" height="24" rx="5" fill="#FCEEF0" stroke="#9D8BC9" stroke-width="2" />
        <rect x="142" y="70" width="10" height="24" rx="5" fill="#FCEEF0" stroke="#9D8BC9" stroke-width="2" />
      `;
    } else if (c.headphones === 'catear') {
      svg += `
        <polygon points="68,44 76,20 86,40" fill="#F4ACB7" stroke="#9D8BC9" stroke-width="2" />
        <polygon points="132,44 124,20 114,40" fill="#F4ACB7" stroke="#9D8BC9" stroke-width="2" />
        <path d="M54 75 C 50 30, 150 30, 146 75" fill="none" stroke="#9D8BC9" stroke-width="6" stroke-linecap="round" />
        <rect x="48" y="70" width="10" height="24" rx="5" fill="#FCEEF0" stroke="#9D8BC9" stroke-width="2" />
        <rect x="142" y="70" width="10" height="24" rx="5" fill="#FCEEF0" stroke="#9D8BC9" stroke-width="2" />
      `;
    }

    svg += `</svg>`;
    return svg;
  }
}

window.AvatarRenderer = AvatarRenderer;
window.AVATAR_PRESETS = AVATAR_PRESETS;
window.DEFAULT_AVATAR = DEFAULT_AVATAR;
