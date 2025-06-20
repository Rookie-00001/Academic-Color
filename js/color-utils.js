// 颜色工具函数模块
class ColorUtils {
    
    // HEX转RGB
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : null;
    }

    // RGB转HEX
    static rgbToHex(r, g, b) {
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }

    // HSL转HEX
    static hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    // HEX转HSL
    static hexToHsl(hex) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return null;
        
        const [r, g, b] = rgb.map(x => x / 255);
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
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

    // 生成随机颜色
    static generateRandomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    }

    // 生成和谐配色方案
    static generateHarmoniousPalette(baseColor, count = 5, type = 'analogous') {
        const hsl = this.hexToHsl(baseColor);
        if (!hsl) return [baseColor];

        const [h, s, l] = hsl;
        const colors = [baseColor];

        switch (type) {
            case 'analogous':
                for (let i = 1; i < count; i++) {
                    const newH = (h + i * 30) % 360;
                    colors.push(this.hslToHex(newH, s, l));
                }
                break;
            
            case 'complementary':
                colors.push(this.hslToHex((h + 180) % 360, s, l));
                if (count > 2) {
                    colors.push(this.hslToHex((h + 60) % 360, s, l));
                    colors.push(this.hslToHex((h + 240) % 360, s, l));
                }
                break;
            
            case 'triadic':
                colors.push(this.hslToHex((h + 120) % 360, s, l));
                colors.push(this.hslToHex((h + 240) % 360, s, l));
                break;
            
            case 'monochromatic':
                for (let i = 1; i < count; i++) {
                    const newL = Math.max(10, Math.min(90, l + (i - count/2) * 20));
                    colors.push(this.hslToHex(h, s, newL));
                }
                break;
            
            default:
                // 生成随机配色
                for (let i = 1; i < count; i++) {
                    colors.push(this.generateRandomColor());
                }
        }

        return colors.slice(0, count);
    }

    // 计算颜色对比度
    static calculateContrast(color1, color2) {
        const luminance1 = this.getLuminance(color1);
        const luminance2 = this.getLuminance(color2);
        const brighter = Math.max(luminance1, luminance2);
        const darker = Math.min(luminance1, luminance2);
        return (brighter + 0.05) / (darker + 0.05);
    }

    // 获取颜色亮度
    static getLuminance(hex) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return 0;
        
        const [r, g, b] = rgb.map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    // 判断颜色是否为深色
    static isDark(hex) {
        return this.getLuminance(hex) < 0.5;
    }

    // 获取文本颜色（根据背景色自动选择黑或白）
    static getTextColor(backgroundColor) {
        return this.isDark(backgroundColor) ? '#ffffff' : '#000000';
    }

    // 颜色混合
    static blendColors(color1, color2, ratio = 0.5) {
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        
        if (!rgb1 || !rgb2) return color1;
        
        const blended = rgb1.map((c1, i) => {
            const c2 = rgb2[i];
            return Math.round(c1 * (1 - ratio) + c2 * ratio);
        });
        
        return this.rgbToHex(...blended);
    }

    // 获取颜色的互补色
    static getComplementaryColor(hex) {
        const hsl = this.hexToHsl(hex);
        if (!hsl) return hex;
        
        const [h, s, l] = hsl;
        return this.hslToHex((h + 180) % 360, s, l);
    }

    // 调整颜色亮度
    static adjustBrightness(hex, amount) {
        const hsl = this.hexToHsl(hex);
        if (!hsl) return hex;
        
        const [h, s, l] = hsl;
        const newL = Math.max(0, Math.min(100, l + amount));
        return this.hslToHex(h, s, newL);
    }

    // 调整颜色饱和度
    static adjustSaturation(hex, amount) {
        const hsl = this.hexToHsl(hex);
        if (!hsl) return hex;
        
        const [h, s, l] = hsl;
        const newS = Math.max(0, Math.min(100, s + amount));
        return this.hslToHex(h, newS, l);
    }

    // 生成渐变色
    static generateGradient(startColor, endColor, steps = 10) {
        const colors = [];
        for (let i = 0; i < steps; i++) {
            const ratio = i / (steps - 1);
            colors.push(this.blendColors(startColor, endColor, ratio));
        }
        return colors;
    }

    // 验证颜色格式
    static isValidHex(hex) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
    }

    // 格式化颜色值
    static formatColor(color, format = 'hex') {
        if (!this.isValidHex(color)) return color;
        
        switch (format.toLowerCase()) {
            case 'rgb':
                const rgb = this.hexToRgb(color);
                return rgb ? `rgb(${rgb.join(', ')})` : color;
            
            case 'rgba':
                const rgba = this.hexToRgb(color);
                return rgba ? `rgba(${rgba.join(', ')}, 1)` : color;
            
            case 'hsl':
                const hsl = this.hexToHsl(color);
                return hsl ? `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)` : color;
            
            default:
                return color.toUpperCase();
        }
    }

    // 获取颜色名称（基础色彩识别）
    static getColorName(hex) {
        const colorNames = {
            '#FF0000': '红色',
            '#00FF00': '绿色',
            '#0000FF': '蓝色',
            '#FFFF00': '黄色',
            '#FF00FF': '洋红',
            '#00FFFF': '青色',
            '#000000': '黑色',
            '#FFFFFF': '白色',
            '#808080': '灰色',
            '#FFA500': '橙色',
            '#800080': '紫色',
            '#FFC0CB': '粉色'
        };
        
        // 找最接近的颜色
        let minDistance = Infinity;
        let closestColor = '未知颜色';
        
        const targetRgb = this.hexToRgb(hex);
        if (!targetRgb) return closestColor;
        
        Object.entries(colorNames).forEach(([colorHex, name]) => {
            const colorRgb = this.hexToRgb(colorHex);
            if (colorRgb) {
                const distance = Math.sqrt(
                    Math.pow(targetRgb[0] - colorRgb[0], 2) +
                    Math.pow(targetRgb[1] - colorRgb[1], 2) +
                    Math.pow(targetRgb[2] - colorRgb[2], 2)
                );
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closestColor = name;
                }
            }
        });
        
        return closestColor;
    }

    // 生成主题配色方案
    static generateThemePalette(themeName, count = 5) {
        const themes = {
            nature: { base: '#2d5a27', type: 'analogous' },
            ocean: { base: '#003f5c', type: 'monochromatic' },
            sunset: { base: '#ff6b6b', type: 'complementary' },
            medical: { base: '#e74c3c', type: 'triadic' },
            minimal: { base: '#2c3e50', type: 'monochromatic' },
            tropical: { base: '#00b894', type: 'analogous' }
        };
        
        const theme = themes[themeName] || themes.nature;
        return this.generateHarmoniousPalette(theme.base, count, theme.type);
    }

    // 导出配色为不同格式
    static exportPalette(colors, format = 'json') {
        switch (format.toLowerCase()) {
            case 'css':
                return colors.map((color, index) => 
                    `--color-${index + 1}: ${color};`
                ).join('\n');
            
            case 'scss':
                return colors.map((color, index) => 
                    `$color-${index + 1}: ${color};`
                ).join('\n');
            
            case 'adobe':
                // Adobe Swatch Exchange format (simplified)
                return colors.map(color => {
                    const rgb = this.hexToRgb(color);
                    return rgb ? `${rgb[0]} ${rgb[1]} ${rgb[2]}` : color;
                }).join('\n');
            
            default:
                return JSON.stringify(colors, null, 2);
        }
    }
}

// 全局暴露ColorUtils
window.ColorUtils = ColorUtils;