// 颜色工具类
class ColorUtils {
    // 十六进制转RGB
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : null;
    }

    // RGB转十六进制
    static rgbToHex(r, g, b) {
        const toHex = (c) => {
            const hex = Math.round(Math.max(0, Math.min(255, c))).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    // 十六进制转HSL
    static hexToHsl(hex) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return null;
        
        const [r, g, b] = rgb.map(c => c / 255);
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    }

    // HSL转十六进制
    static hslToHex(h, s, l) {
        h = h / 360;
        s = s / 100;
        l = l / 100;

        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return this.rgbToHex(r * 255, g * 255, b * 255);
    }

    // RGB转HSL
    static rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    }

    // 调整亮度
    static adjustBrightness(hex, adjustment) {
        const hsl = this.hexToHsl(hex);
        if (!hsl) return hex;
        
        const [h, s, l] = hsl;
        const newL = Math.max(0, Math.min(100, l + adjustment));
        return this.hslToHex(h, s, newL);
    }

    // 调整对比度
    static adjustContrast(hex, contrast) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return hex;
        
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        const newRgb = rgb.map(c => factor * (c - 128) + 128);
        
        return this.rgbToHex(newRgb[0], newRgb[1], newRgb[2]);
    }

    // 调整饱和度
    static adjustSaturation(hex, adjustment) {
        const hsl = this.hexToHsl(hex);
        if (!hsl) return hex;
        
        const [h, s, l] = hsl;
        const newS = Math.max(0, Math.min(100, s + adjustment));
        return this.hslToHex(h, newS, l);
    }

    // 调整色相
    static adjustHue(hex, adjustment) {
        const hsl = this.hexToHsl(hex);
        if (!hsl) return hex;
        
        const [h, s, l] = hsl;
        let newH = (h + adjustment) % 360;
        if (newH < 0) newH += 360;
        return this.hslToHex(newH, s, l);
    }

    // 调整色温
    static adjustTemperature(hex, temp) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return hex;
        
        const factor = temp / 100;
        let [r, g, b] = rgb;
        
        // 暖色调增加红色，减少蓝色
        // 冷色调增加蓝色，减少红色
        r += factor * 30;
        b -= factor * 30;
        
        return this.rgbToHex(r, g, b);
    }

    // 色盲模拟
    static simulateColorBlindness(hex, type) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return hex;
        
        const [r, g, b] = rgb.map(c => c / 255);
        let newR, newG, newB;

        switch (type) {
            case 'protanopia': // 红色盲 (L型色盲)
                newR = 0.567 * r + 0.433 * g;
                newG = 0.558 * r + 0.442 * g;
                newB = 0.242 * g + 0.758 * b;
                break;
            case 'deuteranopia': // 绿色盲 (M型色盲)
                newR = 0.625 * r + 0.375 * g;
                newG = 0.7 * r + 0.3 * g;
                newB = 0.3 * g + 0.7 * b;
                break;
            case 'tritanopia': // 蓝色盲 (S型色盲)
                newR = 0.95 * r + 0.05 * g;
                newG = 0.433 * g + 0.567 * b;
                newB = 0.475 * g + 0.525 * b;
                break;
            case 'achromatopsia': // 全色盲
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                newR = newG = newB = gray;
                break;
            case 'protanomaly': // 红色弱视
                newR = 0.817 * r + 0.183 * g;
                newG = 0.333 * r + 0.667 * g;
                newB = 0.125 * g + 0.875 * b;
                break;
            case 'deuteranomaly': // 绿色弱视
                newR = 0.8 * r + 0.2 * g;
                newG = 0.258 * r + 0.742 * g;
                newB = 0.142 * g + 0.858 * b;
                break;
            case 'tritanomaly': // 蓝色弱视
                newR = 0.967 * r + 0.033 * g;
                newG = 0.733 * g + 0.267 * b;
                newB = 0.183 * g + 0.817 * b;
                break;
            default:
                return hex;
        }

        return this.rgbToHex(newR * 255, newG * 255, newB * 255);
    }

    // 应用所有调整
    static applyColorAdjustments(color, adjustments, colorBlindMode) {
        const hsl = this.hexToHsl(color);
        if (!hsl) return color;
        
        let [h, s, l] = hsl;
        
        // 应用色相调整
        h = (h + adjustments.hue) % 360;
        if (h < 0) h += 360;
        
        // 应用饱和度调整
        s = Math.max(0, Math.min(100, s + adjustments.saturation));
        
        // 应用亮度调整
        l = Math.max(0, Math.min(100, l + adjustments.brightness));
        
        let adjustedColor = this.hslToHex(h, s, l);
        
        // 应用对比度
        if (adjustments.contrast !== 0) {
            adjustedColor = this.adjustContrast(adjustedColor, adjustments.contrast);
        }
        
        // 应用色温
        if (adjustments.temperature !== 0) {
            adjustedColor = this.adjustTemperature(adjustedColor, adjustments.temperature);
        }

        // 应用色盲模拟
        if (colorBlindMode !== 'none') {
            adjustedColor = this.simulateColorBlindness(adjustedColor, colorBlindMode);
        }

        return adjustedColor;
    }

    // 生成随机颜色
    static generateRandomColor() {
        return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    }

    // 生成和谐配色方案
    static generateHarmoniousPalette(baseColor, count, type = 'analogous') {
        const hsl = this.hexToHsl(baseColor);
        if (!hsl) return [baseColor];
        
        const [h, s, l] = hsl;
        const colors = [];
        
        for (let i = 0; i < count; i++) {
            let newH = h;
            let newS = s;
            let newL = l;
            
            switch (type) {
                case 'analogous':
                    // 相邻色：色相相差30度以内
                    newH = (h + (i * 30)) % 360;
                    break;
                case 'complementary':
                    // 互补色：色相相差180度
                    newH = i % 2 === 0 ? h : (h + 180) % 360;
                    break;
                case 'triadic':
                    // 三角色：色相相差120度
                    newH = (h + (i * 120)) % 360;
                    break;
                case 'tetradic':
                    // 四角色：色相相差90度
                    newH = (h + (i * 90)) % 360;
                    break;
                case 'monochromatic':
                    // 单色：同一色相，不同明度和饱和度
                    newL = Math.max(20, Math.min(80, l + (i - count/2) * 15));
                    newS = Math.max(20, Math.min(100, s + (Math.random() - 0.5) * 20));
                    break;
                case 'split-complementary':
                    // 分裂互补色
                    if (i === 0) newH = h;
                    else if (i === 1) newH = (h + 150) % 360;
                    else if (i === 2) newH = (h + 210) % 360;
                    else newH = (h + (i * 60)) % 360;
                    break;
                default:
                    newH = (h + (i * 360 / count)) % 360;
            }
            
            colors.push(this.hslToHex(newH, newS, newL));
        }
        
        return colors;
    }

    // 获取颜色名称（简化版）
    static getColorName(hex) {
        const colorNames = {
            '#FF0000': '红色', '#00FF00': '绿色', '#0000FF': '蓝色',
            '#FFFF00': '黄色', '#FF00FF': '品红', '#00FFFF': '青色',
            '#000000': '黑色', '#FFFFFF': '白色', '#808080': '灰色',
            '#800080': '紫色', '#008000': '深绿', '#000080': '深蓝',
            '#800000': '深红', '#808000': '橄榄', '#FFA500': '橙色',
            '#FFC0CB': '粉色', '#A52A2A': '棕色', '#D2691E': '巧克力色'
        };
        
        const upperHex = hex.toUpperCase();
        if (colorNames[upperHex]) {
            return colorNames[upperHex];
        }
        
        // 简单的颜色分类
        const hsl = this.hexToHsl(hex);
        if (!hsl) return '未知颜色';
        
        const [h, s, l] = hsl;
        
        if (s < 10) {
            if (l < 25) return '深灰色';
            else if (l > 75) return '浅灰色';
            else return '灰色';
        }
        
        if (h >= 0 && h < 30) return '红色系';
        else if (h < 60) return '橙色系';
        else if (h < 120) return '黄色系';
        else if (h < 180) return '绿色系';
        else if (h < 240) return '青色系';
        else if (h < 300) return '蓝色系';
        else return '紫色系';
    }

    // 计算颜色对比度
    static getContrastRatio(color1, color2) {
        const getLuminance = (hex) => {
            const rgb = this.hexToRgb(hex);
            if (!rgb) return 0;
            
            const [r, g, b] = rgb.map(c => {
                c = c / 255;
                return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            });
            
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };
        
        const lum1 = getLuminance(color1);
        const lum2 = getLuminance(color2);
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        
        return (brightest + 0.05) / (darkest + 0.05);
    }

    // 判断颜色是否为深色
    static isDarkColor(hex) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return false;
        
        const [r, g, b] = rgb;
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness < 128;
    }

    // 获取最佳文本颜色（黑色或白色）
    static getBestTextColor(backgroundColor) {
        return this.isDarkColor(backgroundColor) ? '#FFFFFF' : '#000000';
    }

    // 混合两种颜色
    static blendColors(color1, color2, ratio = 0.5) {
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        
        if (!rgb1 || !rgb2) return color1;
        
        const blended = rgb1.map((c1, i) => {
            const c2 = rgb2[i];
            return Math.round(c1 * (1 - ratio) + c2 * ratio);
        });
        
        return this.rgbToHex(blended[0], blended[1], blended[2]);
    }

    // 创建渐变色
    static createGradient(startColor, endColor, steps) {
        const colors = [];
        for (let i = 0; i < steps; i++) {
            const ratio = i / (steps - 1);
            colors.push(this.blendColors(startColor, endColor, ratio));
        }
        return colors;
    }

    // 验证颜色格式
    static isValidHex(hex) {
        return /^#([0-9A-F]{3}){1,2}$/i.test(hex);
    }

    // 将3位hex转换为6位hex
    static expandHex(hex) {
        if (hex.length === 4) {
            return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
        }
        return hex;
    }

    // 获取颜色的温度感知
    static getColorTemperature(hex) {
        const hsl = this.hexToHsl(hex);
        if (!hsl) return 'neutral';
        
        const h = hsl[0];
        
        if ((h >= 0 && h <= 45) || (h >= 315 && h <= 360)) {
            return 'warm'; // 红色系
        } else if (h >= 46 && h <= 135) {
            return 'warm'; // 黄色-绿色系
        } else if (h >= 136 && h <= 255) {
            return 'cool'; // 青色-蓝色系
        } else {
            return 'cool'; // 紫色系
        }
    }

    // 获取颜色的情感属性
    static getColorMood(hex) {
        const hsl = this.hexToHsl(hex);
        if (!hsl) return 'neutral';
        
        const [h, s, l] = hsl;
        
        // 基于色相、饱和度和亮度判断情感
        if (s < 20) return 'calm'; // 低饱和度 = 平静
        if (l > 80) return 'cheerful'; // 高亮度 = 愉快
        if (l < 30) return 'serious'; // 低亮度 = 严肃
        
        if (h >= 0 && h < 60) return 'energetic'; // 红橙色 = 活力
        if (h >= 60 && h < 120) return 'fresh'; // 黄绿色 = 清新
        if (h >= 120 && h < 240) return 'calm'; // 绿蓝色 = 平静
        if (h >= 240 && h < 300) return 'creative'; // 蓝紫色 = 创意
        
        return 'balanced';
    }

    // 生成配色建议
    static generateColorSuggestions(baseColor, purpose = 'general') {
        const suggestions = {
            primary: baseColor,
            secondary: '',
            accent: '',
            background: '',
            text: this.getBestTextColor(baseColor)
        };
        
        const hsl = this.hexToHsl(baseColor);
        if (!hsl) return suggestions;
        
        const [h, s, l] = hsl;
        
        switch (purpose) {
            case 'website':
                suggestions.secondary = this.hslToHex((h + 30) % 360, Math.max(20, s - 20), Math.min(90, l + 20));
                suggestions.accent = this.hslToHex((h + 180) % 360, Math.min(100, s + 20), Math.max(30, l - 10));
                suggestions.background = this.hslToHex(h, Math.max(5, s - 40), Math.min(95, l + 40));
                break;
            case 'presentation':
                suggestions.secondary = this.hslToHex((h + 60) % 360, s, Math.max(20, l - 20));
                suggestions.accent = this.hslToHex((h + 120) % 360, Math.min(100, s + 10), l);
                suggestions.background = '#FFFFFF';
                break;
            case 'print':
                suggestions.secondary = this.hslToHex(h, Math.max(10, s - 30), Math.max(20, l - 30));
                suggestions.accent = this.hslToHex((h + 45) % 360, s, Math.min(80, l + 10));
                suggestions.background = '#FFFFFF';
                break;
            default:
                suggestions.secondary = this.hslToHex((h + 30) % 360, s, l);
                suggestions.accent = this.hslToHex((h + 180) % 360, s, l);
                suggestions.background = this.hslToHex(h, Math.max(10, s - 30), Math.min(95, l + 30));
        }
        
        return suggestions;
    }

    // 获取配色的可访问性评分
    static getAccessibilityScore(backgroundColor, textColor) {
        const contrastRatio = this.getContrastRatio(backgroundColor, textColor);
        
        if (contrastRatio >= 7) return { score: 'AAA', ratio: contrastRatio };
        if (contrastRatio >= 4.5) return { score: 'AA', ratio: contrastRatio };
        if (contrastRatio >= 3) return { score: 'AA Large', ratio: contrastRatio };
        return { score: 'Fail', ratio: contrastRatio };
    }
}
