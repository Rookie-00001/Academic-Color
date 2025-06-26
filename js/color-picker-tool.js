// 图片取色器工具类
class ColorPickerTool {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.image = null;
        this.scale = 1;
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.colorHistory = [];
        this.currentColor = { r: 255, g: 255, b: 255 };
        
        // 性能优化变量
        this.mouseThrottle = false;
        this.tempCanvas = null;
        this.tempCtx = null;
        
        // 画布居中相关
        this.canvasContainer = null;
    }

    // 初始化
    init() {
        this.setupEventListeners();
        this.loadColorHistory();
    }

    // 设置事件监听器
    setupEventListeners() {
        // 文件输入
        const imageInput = document.getElementById('imageInput');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        }

        // 拖拽上传
        const uploadArea = document.querySelector('.upload-area');
        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
            uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
            uploadArea.addEventListener('dragenter', (e) => this.handleDragEnter(e));
            uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        }
    }

    // 处理图片上传
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.loadImage(file);
        }
    }

    // 处理拖拽
    handleDragOver(event) {
        event.preventDefault();
        event.currentTarget.classList.add('drag-over');
    }

    handleDragEnter(event) {
        event.preventDefault();
        event.currentTarget.classList.add('drag-over');
    }

    handleDragLeave(event) {
        event.preventDefault();
        if (!event.currentTarget.contains(event.relatedTarget)) {
            event.currentTarget.classList.remove('drag-over');
        }
    }

    handleDrop(event) {
        event.preventDefault();
        event.currentTarget.classList.remove('drag-over');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            this.loadImage(files[0]);
        }
    }

    // 加载图片
    loadImage(file) {
        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            this.showMessage('请选择有效的图片文件', 'error');
            return;
        }

        // 验证文件大小 (10MB)
        if (file.size > 10 * 1024 * 1024) {
            this.showMessage('图片文件过大，请选择小于10MB的图片', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.image = img;
                // 先显示界面，然后等待下一帧再设置画布
                this.showColorPickerMain();
                // 使用 requestAnimationFrame 确保容器已完全渲染
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        this.setupCanvas();
                        this.showMessage('图片加载成功，点击图片获取颜色', 'success');
                    }, 100); // 给容器一点时间完成渲染
                });
            };
            img.onerror = () => {
                this.showMessage('图片加载失败，请尝试其他图片', 'error');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // 设置画布
    setupCanvas() {
        this.canvas = document.getElementById('imageCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvasContainer = document.getElementById('imageContainer');
        
        // 强制获取实际渲染后的容器尺寸
        const containerRect = this.canvasContainer.getBoundingClientRect();
        const containerPadding = 40; // 增加边距
        const containerWidth = containerRect.width - containerPadding;
        const containerHeight = containerRect.height - containerPadding;
        
        console.log('容器尺寸:', { width: containerWidth, height: containerHeight });
        console.log('图片尺寸:', { width: this.image.width, height: this.image.height });
        
        // 计算最佳缩放比例，确保图片完整显示且尽可能大
        const scaleX = containerWidth / this.image.width;
        const scaleY = containerHeight / this.image.height;
        this.scale = Math.min(scaleX, scaleY, 1); // 不超过原始尺寸
        
        // 确保缩放比例合理
        if (this.scale <= 0 || !isFinite(this.scale)) {
            this.scale = 0.8;
        }
        
        console.log('计算的缩放比例:', this.scale);
        
        // 设置画布尺寸为缩放后的图片尺寸
        this.canvas.width = Math.round(this.image.width * this.scale);
        this.canvas.height = Math.round(this.image.height * this.scale);
        
        // 重置偏移
        this.offsetX = 0;
        this.offsetY = 0;
        
        // 绘制图片并设置画布位置
        this.drawImage();
        this.centerCanvas();
        this.setupCanvasEvents();
        
        console.log('最终画布尺寸:', { width: this.canvas.width, height: this.canvas.height });
    }

    // 居中显示画布
    centerCanvas() {
        const containerRect = this.canvasContainer.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        
        // 计算画布应该的位置，使其在容器中居中
        const canvasLeft = Math.max(0, (containerWidth - this.canvas.width) / 2);
        const canvasTop = Math.max(0, (containerHeight - this.canvas.height) / 2);
        
        // 设置画布位置
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = canvasLeft + 'px';
        this.canvas.style.top = canvasTop + 'px';
        this.canvas.style.borderRadius = '8px';
        this.canvas.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    }

    // 绘制图片
    drawImage() {
        // 清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 保存上下文状态
        this.ctx.save();
        
        // 应用偏移（用于拖拽）
        this.ctx.translate(this.offsetX, this.offsetY);
        
        // 绘制图片，填满整个画布
        this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
        
        // 恢复上下文状态
        this.ctx.restore();
    }

    // 设置画布事件
    setupCanvasEvents() {
        // 鼠标移动预览 - 添加节流
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.mouseThrottle) {
                this.mouseThrottle = true;
                requestAnimationFrame(() => {
                    this.handleMouseMove(e);
                    this.mouseThrottle = false;
                });
            }
        });
        
        this.canvas.addEventListener('mouseleave', () => this.hideColorPreview());
        
        // 点击取色
        this.canvas.addEventListener('click', (e) => this.handleColorPick(e));
        
        // 拖拽移动
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseDrag(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());
    }

    // 处理鼠标移动
    handleMouseMove(event) {
        if (this.isDragging) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = event.clientX - rect.left - this.offsetX;
        const canvasY = event.clientY - rect.top - this.offsetY;
        
        // 将画布坐标转换为原始图片坐标
        const imageX = (canvasX / this.canvas.width) * this.image.width;
        const imageY = (canvasY / this.canvas.height) * this.image.height;
        
        if (imageX >= 0 && imageX < this.image.width && imageY >= 0 && imageY < this.image.height && 
            canvasX >= 0 && canvasX < this.canvas.width && canvasY >= 0 && canvasY < this.canvas.height) {
            const color = this.getColorAtPosition(imageX, imageY);
            this.showColorPreview(event.clientX, event.clientY, color);
        } else {
            this.hideColorPreview();
        }
    }

    // 显示颜色预览
    showColorPreview(clientX, clientY, color) {
        const preview = document.getElementById('colorPreview');
        const previewColor = document.getElementById('previewColor');
        const previewHex = document.getElementById('previewHex');
        const previewRgb = document.getElementById('previewRgb');
        
        if (preview && previewColor && previewHex && previewRgb) {
            preview.style.left = (clientX + 15) + 'px';
            preview.style.top = (clientY - 60) + 'px';
            preview.style.display = 'block';
            
            const hex = this.rgbToHex(color.r, color.g, color.b);
            previewColor.style.backgroundColor = hex;
            previewHex.textContent = hex;
            previewRgb.textContent = `RGB(${color.r}, ${color.g}, ${color.b})`;
            
            preview.classList.remove('hidden');
            preview.classList.add('preview-show');
        }
    }

    // 隐藏颜色预览
    hideColorPreview() {
        const preview = document.getElementById('colorPreview');
        if (preview) {
            preview.classList.remove('preview-show');
            preview.classList.add('hidden');
        }
    }

    // 处理点击取色
    handleColorPick(event) {
        if (this.isDragging) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = event.clientX - rect.left - this.offsetX;
        const canvasY = event.clientY - rect.top - this.offsetY;
        
        // 将画布坐标转换为原始图片坐标
        const imageX = (canvasX / this.canvas.width) * this.image.width;
        const imageY = (canvasY / this.canvas.height) * this.image.height;
        
        if (imageX >= 0 && imageX < this.image.width && imageY >= 0 && imageY < this.image.height &&
            canvasX >= 0 && canvasX < this.canvas.width && canvasY >= 0 && canvasY < this.canvas.height) {
            const color = this.getColorAtPosition(imageX, imageY);
            this.setCurrentColor(color);
            
            // 简单的视觉反馈
            this.canvas.style.filter = 'brightness(1.1)';
            setTimeout(() => {
                this.canvas.style.filter = 'none';
            }, 100);
        }
    }

    // 获取指定位置的颜色
    getColorAtPosition(x, y) {
        const precision = parseInt(document.getElementById('precisionSelect')?.value || '3');
        
        // 使用类属性存储临时canvas，避免重复创建
        if (!this.tempCanvas) {
            this.tempCanvas = document.createElement('canvas');
            this.tempCtx = this.tempCanvas.getContext('2d');
        }
        
        // 只在图片变化时重新绘制
        if (this.tempCanvas.width !== this.image.width || this.tempCanvas.height !== this.image.height) {
            this.tempCanvas.width = this.image.width;
            this.tempCanvas.height = this.image.height;
            this.tempCtx.drawImage(this.image, 0, 0);
        }
        
        if (precision === 1) {
            // 精确到像素
            const pixel = this.tempCtx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
            return { r: pixel[0], g: pixel[1], b: pixel[2] };
        } else {
            // 区域平均
            const halfPrecision = Math.floor(precision / 2);
            const startX = Math.max(0, Math.floor(x) - halfPrecision);
            const startY = Math.max(0, Math.floor(y) - halfPrecision);
            const endX = Math.min(this.image.width, startX + precision);
            const endY = Math.min(this.image.height, startY + precision);
            
            const imageData = this.tempCtx.getImageData(startX, startY, endX - startX, endY - startY);
            const pixels = imageData.data;
            
            let r = 0, g = 0, b = 0, count = 0;
            for (let i = 0; i < pixels.length; i += 4) {
                r += pixels[i];
                g += pixels[i + 1];
                b += pixels[i + 2];
                count++;
            }
            
            return {
                r: Math.round(r / count),
                g: Math.round(g / count),
                b: Math.round(b / count)
            };
        }
    }

    // 设置当前颜色
    setCurrentColor(color) {
        this.currentColor = color;
        
        const hex = this.rgbToHex(color.r, color.g, color.b);
        const hsl = this.rgbToHsl(color.r, color.g, color.b);
        const cmyk = this.rgbToCmyk(color.r, color.g, color.b);
        
        // 获取颜色展示元素，确保只更新取色器内的元素
        const colorShowcase = document.querySelector('#colorPickerView #colorShowcase');
        const colorText = document.querySelector('#colorPickerView #colorText');
        const hexValue = document.querySelector('#colorPickerView #hexValue');
        const rgbValue = document.querySelector('#colorPickerView #rgbValue');
        const hslValue = document.querySelector('#colorPickerView #hslValue');
        const cmykValue = document.querySelector('#colorPickerView #cmykValue');
        
        // 更新显示
        if (colorShowcase) {
            colorShowcase.style.backgroundColor = hex;
        }
        if (colorText) {
            colorText.textContent = hex;
            const brightness = (color.r * 299 + color.g * 587 + color.b * 114) / 1000;
            colorText.style.color = brightness > 128 ? '#000000' : '#ffffff';
        }
        if (hexValue) hexValue.value = hex;
        if (rgbValue) rgbValue.value = `rgb(${color.r}, ${color.g}, ${color.b})`;
        if (hslValue) hslValue.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        if (cmykValue) cmykValue.value = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
    }

    // 鼠标拖拽相关
    handleMouseDown(event) {
        if (event.shiftKey || event.button === 1) { // Shift+左键 或 中键
            this.isDragging = true;
            this.lastX = event.clientX;
            this.lastY = event.clientY;
            this.canvas.style.cursor = 'grabbing';
            event.preventDefault();
        }
    }

    handleMouseDrag(event) {
        if (this.isDragging) {
            const deltaX = event.clientX - this.lastX;
            const deltaY = event.clientY - this.lastY;
            
            this.offsetX += deltaX;
            this.offsetY += deltaY;
            
            this.lastX = event.clientX;
            this.lastY = event.clientY;
            
            this.drawImage();
            event.preventDefault();
        }
    }

    handleMouseUp() {
        this.isDragging = false;
        this.canvas.style.cursor = 'crosshair';
    }

    // 颜色格式转换
    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    rgbToHsl(r, g, b) {
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
        
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    rgbToCmyk(r, g, b) {
        const c = 1 - (r / 255);
        const m = 1 - (g / 255);
        const y = 1 - (b / 255);
        const k = Math.min(c, Math.min(m, y));
        
        return {
            c: Math.round(((c - k) / (1 - k)) * 100) || 0,
            m: Math.round(((m - k) / (1 - k)) * 100) || 0,
            y: Math.round(((y - k) / (1 - k)) * 100) || 0,
            k: Math.round(k * 100)
        };
    }

    // 复制颜色值
    copyColor(format) {
        let value = '';
        switch (format) {
            case 'hex':
                value = document.getElementById('hexValue').value;
                break;
            case 'rgb':
                value = document.getElementById('rgbValue').value;
                break;
            case 'hsl':
                value = document.getElementById('hslValue').value;
                break;
            case 'cmyk':
                value = document.getElementById('cmykValue').value;
                break;
        }
        
        if (value) {
            navigator.clipboard.writeText(value).then(() => {
                this.showMessage(`${format.toUpperCase()} 值已复制: ${value}`, 'success');
            });
        }
    }

    // 添加到历史
    addToHistory() {
        const hex = this.rgbToHex(this.currentColor.r, this.currentColor.g, this.currentColor.b);
        
        // 避免重复
        if (!this.colorHistory.some(color => color.hex === hex)) {
            const colorData = {
                hex: hex,
                rgb: this.currentColor,
                timestamp: new Date(),
                id: Date.now()
            };
            
            this.colorHistory.unshift(colorData);
            
            // 限制历史数量
            if (this.colorHistory.length > 20) {
                this.colorHistory = this.colorHistory.slice(0, 20);
            }
            
            this.saveColorHistory();
            this.renderColorHistory();
            this.showMessage('颜色已添加到历史记录', 'success');
        } else {
            this.showMessage('该颜色已在历史记录中', 'info');
        }
    }

    // 渲染颜色历史
    renderColorHistory() {
        const container = document.getElementById('colorHistory');
        const countElement = document.getElementById('historyCount');
        
        if (!container) return;
        
        countElement.textContent = this.colorHistory.length;
        
        if (this.colorHistory.length === 0) {
            container.innerHTML = `
                <div class="history-empty">
                    <svg class="w-12 h-12 text-theme-tertiary mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                    </svg>
                    <p class="text-theme-secondary text-sm">还没有取色历史</p>
                    <p class="text-theme-tertiary text-xs">点击图片开始取色</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.colorHistory.map(color => `
            <div class="history-item" onclick="colorPickerTool.selectHistoryColor('${color.hex}')">
                <div class="history-color" style="background-color: ${color.hex};"></div>
                <div class="history-info">
                    <div class="history-hex">${color.hex}</div>
                    <div class="history-rgb">RGB(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})</div>
                    <div class="history-time">${this.formatTime(color.timestamp)}</div>
                </div>
                <button onclick="event.stopPropagation(); colorPickerTool.removeFromHistory(${color.id})" class="history-remove" title="删除">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `).join('');
    }

    // 选择历史颜色
    selectHistoryColor(hex) {
        const rgb = this.hexToRgb(hex);
        this.setCurrentColor(rgb);
        this.showMessage(`已选择颜色: ${hex}`, 'success');
    }

    // 从历史中移除
    removeFromHistory(id) {
        this.colorHistory = this.colorHistory.filter(color => color.id !== id);
        this.saveColorHistory();
        this.renderColorHistory();
    }

    // 清空历史
    clearHistory() {
        this.colorHistory = [];
        this.saveColorHistory();
        this.renderColorHistory();
        this.showMessage('历史记录已清空', 'success');
    }

    // Hex转RGB
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // 生成配色方案
    generatePalette() {
        const baseHex = this.rgbToHex(this.currentColor.r, this.currentColor.g, this.currentColor.b);
        
        if (window.ColorUtils) {
            const palette = ColorUtils.generateHarmoniousPalette(baseHex, 5, 'analogous');
            
            // 切换到我的配色页面并应用生成的配色
            if (window.myPalettes) {
                myPalettes.originalPalette = palette;
                myPalettes.applyAdjustments();
                
                // 切换视图
                if (window.navigationManager) {
                    navigationManager.showMyPalettesView();
                    this.showMessage('已生成配色方案并跳转到我的配色', 'success');
                }
            }
        }
    }

    // 工具函数
    formatTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;
        
        if (diff < 60000) return '刚刚';
        if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
        if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
        return Math.floor(diff / 86400000) + '天前';
    }

    showMessage(message, type = 'info') {
        if (window.uiComponents) {
            uiComponents.showCopyToast(message);
        }
    }

    // 存储相关
    saveColorHistory() {
        localStorage.setItem('color_picker_history', JSON.stringify(this.colorHistory));
    }

    loadColorHistory() {
        const saved = localStorage.getItem('color_picker_history');
        if (saved) {
            this.colorHistory = JSON.parse(saved).map(item => ({
                ...item,
                timestamp: new Date(item.timestamp)
            }));
            this.renderColorHistory();
        }
    }

    // 显示取色器主界面
    showColorPickerMain() {
        document.getElementById('uploadSection').style.display = 'none';
        document.getElementById('colorPickerMain').classList.remove('hidden');
    }

    // 重置缩放
    resetZoom() {
        // 重新设置画布，相当于重新加载
        this.setupCanvas();
    }

    // 清除图片
    clearImage() {
        document.getElementById('uploadSection').style.display = 'block';
        document.getElementById('colorPickerMain').classList.add('hidden');
        document.getElementById('imageInput').value = '';
        
        if (this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        this.image = null;
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.tempCanvas = null;
        this.tempCtx = null;
    }
}

// 创建全局实例
const colorPickerTool = new ColorPickerTool();