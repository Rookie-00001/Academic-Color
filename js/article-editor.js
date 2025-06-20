// 文章编辑器模块
class ArticleEditor {
    constructor() {
        this.currentFigureIndex = 0;
        this.figuresData = [];
        this.uploadedImages = [];
        this.previewImageUrls = [];
        this.colorPickers = {}; // 存储取色器实例
    }

    // 初始化编辑器
    init() {
        this.initFormFields();
        this.setupEventListeners();
    }

    // 初始化表单字段
    initFormFields() {
        this.populateFields();
        this.populateYears();
        this.addFigure(); // 默认添加一个图表
    }

    // 设置事件监听器
    setupEventListeners() {
        const fieldSelect = document.getElementById('fieldSelect');
        if (fieldSelect) {
            fieldSelect.addEventListener('change', () => this.updateJournals());
        }

        // 期刊颜色同步
        const colorInput = document.getElementById('newJournalColor');
        const colorText = document.getElementById('newJournalColorText');
        if (colorInput && colorText) {
            colorInput.addEventListener('input', (e) => {
                colorText.value = e.target.value;
            });
            colorText.addEventListener('input', (e) => {
                if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                    colorInput.value = e.target.value;
                }
            });
        }
    }

    // 填充研究领域选项
    populateFields() {
        const fieldSelect = document.getElementById('fieldSelect');
        if (!fieldSelect) return;

        const fields = dataManager.getFields();
        fieldSelect.innerHTML = '<option value="">请选择研究领域</option>';
        
        Object.entries(fields).forEach(([key, field]) => {
            if (key !== 'all') {
                fieldSelect.innerHTML += `<option value="${key}">${field.name}</option>`;
            }
        });
    }

    // 根据选择的领域更新期刊选项
    updateJournals() {
        const fieldSelect = document.getElementById('fieldSelect');
        const journalSelect = document.getElementById('journalSelect');
        
        if (!fieldSelect || !journalSelect) return;

        const selectedField = fieldSelect.value;
        journalSelect.innerHTML = '<option value="">请选择期刊</option>';

        if (selectedField) {
            const journals = dataManager.getJournalsByField(selectedField);
            journals.forEach(([key, journal]) => {
                journalSelect.innerHTML += `<option value="${key}">${journal.name}</option>`;
            });
        }
    }

    // 填充年份选项
    populateYears() {
        const yearSelect = document.getElementById('yearSelect');
        if (!yearSelect) return;

        const currentYear = new Date().getFullYear();
        yearSelect.innerHTML = '<option value="">请选择年份</option>';
        
        for (let year = currentYear; year >= 2020; year--) {
            yearSelect.innerHTML += `<option value="${year}">${year}</option>`;
        }
    }

    // 添加图表
    addFigure() {
        const container = document.getElementById('figuresContainer');
        if (!container) return;

        const figureIndex = this.currentFigureIndex++;
        const figureData = {
            index: figureIndex,
            name: '',
            description: '',
            figure_type: 'scatter_plot',
            image_file: null,
            image_data: null, // 存储图片数据用于取色
            colors: []
        };

        this.figuresData.push(figureData);

        const figureHtml = `
            <div class="figure-editor bg-theme-secondary rounded-lg p-6 mb-6 border border-theme" data-figure-index="${figureIndex}">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="font-semibold text-theme-primary flex items-center">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        </svg>
                        图表 ${figureIndex + 1}
                    </h4>
                    ${this.figuresData.length > 1 ? `
                        <button type="button" onclick="articleEditor.removeFigure(${figureIndex})" 
                                class="text-red-500 hover:text-red-700 transition-colors p-1 rounded">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    ` : ''}
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- 左侧：基本信息和图片 -->
                    <div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-theme-secondary mb-2">图表名称 *</label>
                            <input type="text" placeholder="例：Figure 2A - UMAP细胞聚类图" 
                                   onchange="articleEditor.updateFigureData(${figureIndex}, 'name', this.value)"
                                   class="w-full p-3 border border-theme rounded-lg bg-theme-primary text-theme-primary focus:ring-2 focus:ring-blue-500">
                        </div>

                        <div class="mb-4">
                            <label class="block text-sm font-medium text-theme-secondary mb-2">图表描述</label>
                            <textarea placeholder="简要描述图表内容和用途..." 
                                      onchange="articleEditor.updateFigureData(${figureIndex}, 'description', this.value)"
                                      class="w-full p-3 border border-theme rounded-lg bg-theme-primary text-theme-primary h-20 resize-none focus:ring-2 focus:ring-blue-500"></textarea>
                        </div>

                        <div class="mb-4">
                            <label class="block text-sm font-medium text-theme-secondary mb-2">图表类型</label>
                            <select onchange="articleEditor.updateFigureData(${figureIndex}, 'figure_type', this.value)"
                                    class="w-full p-3 border border-theme rounded-lg bg-theme-primary text-theme-primary focus:ring-2 focus:ring-blue-500">
                                <option value="scatter_plot">散点图</option>
                                <option value="line_plot">折线图</option>
                                <option value="bar_chart">柱状图</option>
                                <option value="heatmap">热图</option>
                                <option value="survival_curve">生存曲线</option>
                                <option value="network">网络图</option>
                            </select>
                        </div>

                        <!-- 图片上传 -->
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-theme-secondary mb-2">上传图片 *</label>
                            <div class="border-2 border-dashed border-theme rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                                <input type="file" id="imageInput_${figureIndex}" accept="image/*" 
                                       onchange="articleEditor.handleImageUpload(${figureIndex}, this)"
                                       class="hidden">
                                <div onclick="document.getElementById('imageInput_${figureIndex}').click()" 
                                     class="cursor-pointer">
                                    <svg class="w-12 h-12 text-theme-tertiary mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                    </svg>
                                    <p class="text-theme-secondary">点击选择图片文件</p>
                                    <p class="text-xs text-theme-tertiary mt-1">支持 JPG, PNG, SVG 格式</p>
                                </div>
                            </div>
                            <div id="imagePreview_${figureIndex}" class="mt-4 hidden">
                                <!-- 图片预览将显示在这里 -->
                            </div>
                        </div>
                    </div>

                    <!-- 右侧：配色管理 -->
                    <div>
                        <div class="flex items-center justify-between mb-4">
                            <label class="block text-sm font-medium text-theme-secondary">配色方案</label>
                            <div class="flex space-x-2">
                                <button type="button" onclick="articleEditor.addColor(${figureIndex})" 
                                        class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors">
                                    添加颜色
                                </button>
                                <button type="button" onclick="articleEditor.autoExtractColors(${figureIndex})" 
                                        class="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                                        id="autoExtractBtn_${figureIndex}" disabled>
                                    智能识别
                                </button>
                            </div>
                        </div>
                        
                        <!-- 配色预览和取色工具 -->
                        <div id="colorPreview_${figureIndex}" class="mb-4 hidden">
                            <div class="bg-theme-primary rounded-lg p-3 mb-3">
                                <h5 class="text-sm font-medium text-theme-secondary mb-2">识别的配色</h5>
                                <div id="extractedColors_${figureIndex}" class="flex flex-wrap gap-2 mb-3">
                                    <!-- 识别的颜色将显示在这里 -->
                                </div>
                                <div class="flex space-x-2">
                                    <button type="button" onclick="articleEditor.applyExtractedColors(${figureIndex})" 
                                            class="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition-colors">
                                        应用全部
                                    </button>
                                    <button type="button" onclick="articleEditor.toggleColorPicker(${figureIndex})" 
                                            class="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 transition-colors">
                                        手动取色
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 取色器画布 -->
                        <div id="colorPickerCanvas_${figureIndex}" class="mb-4 hidden">
                            <div class="bg-theme-primary rounded-lg p-3">
                                <h5 class="text-sm font-medium text-theme-secondary mb-2">点击图片取色</h5>
                                <canvas id="pickCanvas_${figureIndex}" class="cursor-crosshair border border-theme rounded max-w-full"></canvas>
                                <div class="mt-2 flex items-center justify-between">
                                    <div id="pickedColor_${figureIndex}" class="flex items-center space-x-2">
                                        <div class="w-6 h-6 border border-theme rounded" id="colorSample_${figureIndex}"></div>
                                        <span class="text-sm font-mono" id="colorValue_${figureIndex}">#000000</span>
                                    </div>
                                    <button type="button" onclick="articleEditor.addPickedColor(${figureIndex})" 
                                            class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors">
                                        添加此颜色
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div id="colorsContainer_${figureIndex}" class="space-y-3">
                            <!-- 颜色将动态添加到这里 -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', figureHtml);
        this.addColor(figureIndex); // 默认添加一个颜色
    }

    // 处理图片上传
    handleImageUpload(figureIndex, input) {
        const file = input.files[0];
        if (!file) return;

        // 验证文件类型
        const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
        if (!allowedTypes.includes(file.type)) {
            alert('请选择有效的图片文件 (JPG, PNG, SVG)');
            return;
        }

        // 验证文件大小 (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('图片文件大小不能超过 5MB');
            return;
        }

        // 保存文件到对应的图表数据
        const figureData = this.figuresData.find(fig => fig.index === figureIndex);
        if (figureData) {
            figureData.image_file = file;
        }

        // 显示预览并准备取色功能
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageUrl = e.target.result;
            this.setupImagePreview(figureIndex, imageUrl, file.name);
            this.setupColorExtraction(figureIndex, imageUrl);
        };
        reader.readAsDataURL(file);
    }

    // 设置图片预览
    setupImagePreview(figureIndex, imageUrl, fileName) {
        const previewContainer = document.getElementById(`imagePreview_${figureIndex}`);
        if (previewContainer) {
            previewContainer.innerHTML = `
                <div class="relative">
                    <img src="${imageUrl}" alt="图片预览" 
                         class="w-full h-48 object-contain bg-gray-100 rounded-lg border border-theme">
                    <div class="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                        ${fileName}
                    </div>
                </div>
            `;
            previewContainer.classList.remove('hidden');
        }

        // 启用智能识别按钮
        const extractBtn = document.getElementById(`autoExtractBtn_${figureIndex}`);
        if (extractBtn) {
            extractBtn.disabled = false;
        }
    }

    // 设置颜色提取功能
    setupColorExtraction(figureIndex, imageUrl) {
        const img = new Image();
        img.onload = () => {
            const figureData = this.figuresData.find(fig => fig.index === figureIndex);
            if (figureData) {
                figureData.image_data = {
                    img: img,
                    url: imageUrl,
                    width: img.width,
                    height: img.height
                };
            }

            // 设置取色器画布
            this.setupColorPickerCanvas(figureIndex, img);
        };
        img.src = imageUrl;
    }

    // 设置取色器画布
    setupColorPickerCanvas(figureIndex, img) {
        const canvas = document.getElementById(`pickCanvas_${figureIndex}`);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // 计算画布尺寸（保持比例，限制最大宽度）
        const maxWidth = 300;
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        // 绘制图片
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // 添加取色事件
        canvas.addEventListener('click', (e) => {
            this.handleColorPick(figureIndex, e, ctx);
        });

        canvas.addEventListener('mousemove', (e) => {
            this.handleColorPreview(figureIndex, e, ctx);
        });
    }

    // 处理取色
    handleColorPick(figureIndex, event, ctx) {
        const rect = event.target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const imageData = ctx.getImageData(x, y, 1, 1);
        const pixel = imageData.data;
        
        const hex = this.rgbToHex(pixel[0], pixel[1], pixel[2]);
        const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
        
        // 更新颜色显示
        const colorSample = document.getElementById(`colorSample_${figureIndex}`);
        const colorValue = document.getElementById(`colorValue_${figureIndex}`);
        
        if (colorSample) colorSample.style.backgroundColor = hex;
        if (colorValue) colorValue.textContent = hex;
        
        // 存储选中的颜色
        const figureData = this.figuresData.find(fig => fig.index === figureIndex);
        if (figureData) {
            figureData.pickedColor = { hex, rgb };
        }
    }

    // 处理颜色预览
    handleColorPreview(figureIndex, event, ctx) {
        const rect = event.target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const imageData = ctx.getImageData(x, y, 1, 1);
        const pixel = imageData.data;
        
        const hex = this.rgbToHex(pixel[0], pixel[1], pixel[2]);
        
        // 实时更新颜色预览
        const colorSample = document.getElementById(`colorSample_${figureIndex}`);
        if (colorSample) colorSample.style.backgroundColor = hex;
    }

    // 添加取色的颜色
    addPickedColor(figureIndex) {
        const figureData = this.figuresData.find(fig => fig.index === figureIndex);
        if (!figureData || !figureData.pickedColor) {
            alert('请先在图片上点击选择颜色');
            return;
        }

        const colorData = {
            hex: figureData.pickedColor.hex,
            rgb: figureData.pickedColor.rgb,
            name: `颜色 ${figureData.colors.length + 1}`,
            usage: '手动选择'
        };

        figureData.colors.push(colorData);
        this.addColorToDisplay(figureIndex, figureData.colors.length - 1, colorData);
        
        if (window.uiComponents) {
            uiComponents.showCopyToast('颜色已添加到配色方案');
        }
    }

    // 切换取色器显示
    toggleColorPicker(figureIndex) {
        const pickerCanvas = document.getElementById(`colorPickerCanvas_${figureIndex}`);
        if (pickerCanvas) {
            pickerCanvas.classList.toggle('hidden');
        }
    }

    // 自动提取配色
    async autoExtractColors(figureIndex) {
        const figureData = this.figuresData.find(fig => fig.index === figureIndex);
        if (!figureData || !figureData.image_data) {
            alert('请先上传图片');
            return;
        }

        try {
            // 显示加载状态
            const extractBtn = document.getElementById(`autoExtractBtn_${figureIndex}`);
            if (extractBtn) {
                extractBtn.textContent = '识别中...';
                extractBtn.disabled = true;
            }

            // 提取主要颜色
            const colors = await this.extractDominantColors(figureData.image_data.img, 8);
            
            // 显示提取的颜色
            this.displayExtractedColors(figureIndex, colors);
            
            // 恢复按钮状态
            if (extractBtn) {
                extractBtn.textContent = '智能识别';
                extractBtn.disabled = false;
            }

            // 显示预览区域
            const colorPreview = document.getElementById(`colorPreview_${figureIndex}`);
            if (colorPreview) {
                colorPreview.classList.remove('hidden');
            }

        } catch (error) {
            console.error('颜色提取失败:', error);
            alert('颜色识别失败，请重试');
            
            const extractBtn = document.getElementById(`autoExtractBtn_${figureIndex}`);
            if (extractBtn) {
                extractBtn.textContent = '智能识别';
                extractBtn.disabled = false;
            }
        }
    }

    // 提取主要颜色
    async extractDominantColors(img, maxColors = 8) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 缩小图片以提高处理速度
            const scale = Math.min(1, 200 / Math.max(img.width, img.height));
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // 使用改进的颜色量化算法
            const colors = this.quantizeColors(imageData, maxColors);
            resolve(colors);
        });
    }

    // 颜色量化算法（改进版K-means）
    quantizeColors(imageData, k) {
        const data = imageData.data;
        const pixels = [];
        
        // 采样像素（跳过透明像素）
        for (let i = 0; i < data.length; i += 16) { // 每4个像素采样1个
            const alpha = data[i + 3];
            if (alpha > 128) { // 过滤透明像素
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                // 过滤接近白色和黑色的像素
                const brightness = (r + g + b) / 3;
                if (brightness > 20 && brightness < 235) {
                    pixels.push([r, g, b]);
                }
            }
        }

        if (pixels.length === 0) {
            return [{ hex: '#000000', rgb: 'rgb(0, 0, 0)', frequency: 1 }];
        }

        // K-means聚类
        const clusters = this.performKMeans(pixels, Math.min(k, pixels.length));
        
        // 转换为颜色对象并按频率排序
        return clusters
            .map(cluster => ({
                hex: this.rgbToHex(...cluster.center),
                rgb: `rgb(${cluster.center.join(', ')})`,
                frequency: cluster.points.length / pixels.length
            }))
            .sort((a, b) => b.frequency - a.frequency);
    }

    // K-means聚类算法
    performKMeans(pixels, k, maxIterations = 10) {
        // 初始化聚类中心
        const centroids = [];
        for (let i = 0; i < k; i++) {
            const randomIndex = Math.floor(Math.random() * pixels.length);
            centroids.push([...pixels[randomIndex]]);
        }

        for (let iter = 0; iter < maxIterations; iter++) {
            // 分配像素到最近的聚类中心
            const clusters = centroids.map(() => ({ points: [], center: [0, 0, 0] }));
            
            pixels.forEach(pixel => {
                let minDistance = Infinity;
                let closestCluster = 0;
                
                centroids.forEach((centroid, index) => {
                    const distance = this.colorDistance(pixel, centroid);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestCluster = index;
                    }
                });
                
                clusters[closestCluster].points.push(pixel);
            });

            // 更新聚类中心
            let hasChanged = false;
            clusters.forEach((cluster, index) => {
                if (cluster.points.length > 0) {
                    const newCenter = [
                        Math.round(cluster.points.reduce((sum, p) => sum + p[0], 0) / cluster.points.length),
                        Math.round(cluster.points.reduce((sum, p) => sum + p[1], 0) / cluster.points.length),
                        Math.round(cluster.points.reduce((sum, p) => sum + p[2], 0) / cluster.points.length)
                    ];
                    
                    if (!this.arraysEqual(centroids[index], newCenter)) {
                        hasChanged = true;
                        centroids[index] = newCenter;
                        cluster.center = newCenter;
                    } else {
                        cluster.center = centroids[index];
                    }
                } else {
                    cluster.center = centroids[index];
                }
            });

            if (!hasChanged) break;
        }

        return centroids.map((center, index) => ({
            center,
            points: clusters[index].points
        })).filter(cluster => cluster.points.length > 0);
    }

    // 计算颜色距离
    colorDistance(color1, color2) {
        return Math.sqrt(
            Math.pow(color1[0] - color2[0], 2) +
            Math.pow(color1[1] - color2[1], 2) +
            Math.pow(color1[2] - color2[2], 2)
        );
    }

    // 数组相等比较
    arraysEqual(a, b) {
        return a.length === b.length && a.every((val, i) => val === b[i]);
    }

    // 显示提取的颜色
    displayExtractedColors(figureIndex, colors) {
        const container = document.getElementById(`extractedColors_${figureIndex}`);
        if (!container) return;

        container.innerHTML = colors.map((color, index) => `
            <div class="flex flex-col items-center">
                <div class="w-8 h-8 rounded border border-theme cursor-pointer hover:scale-110 transition-transform"
                     style="background-color: ${color.hex};"
                     onclick="articleEditor.addExtractedColor(${figureIndex}, '${color.hex}', '${color.rgb}', ${index})"
                     title="点击添加此颜色 (${(color.frequency * 100).toFixed(1)}%)">
                </div>
                <span class="text-xs text-theme-tertiary mt-1">${(color.frequency * 100).toFixed(0)}%</span>
            </div>
        `).join('');

        // 存储提取的颜色
        const figureData = this.figuresData.find(fig => fig.index === figureIndex);
        if (figureData) {
            figureData.extractedColors = colors;
        }
    }

    // 添加提取的颜色
    addExtractedColor(figureIndex, hex, rgb, colorIndex) {
        const figureData = this.figuresData.find(fig => fig.index === figureIndex);
        if (!figureData) return;

        const colorData = {
            hex,
            rgb,
            name: `提取颜色 ${colorIndex + 1}`,
            usage: '自动识别'
        };

        figureData.colors.push(colorData);
        this.addColorToDisplay(figureIndex, figureData.colors.length - 1, colorData);
        
        if (window.uiComponents) {
            uiComponents.showCopyToast('颜色已添加到配色方案');
        }
    }

    // 应用所有提取的颜色
    applyExtractedColors(figureIndex) {
        const figureData = this.figuresData.find(fig => fig.index === figureIndex);
        if (!figureData || !figureData.extractedColors) return;

        // 清空现有颜色
        figureData.colors = [];
        
        // 添加提取的颜色（最多8个）
        figureData.extractedColors.slice(0, 8).forEach((color, index) => {
            figureData.colors.push({
                hex: color.hex,
                rgb: color.rgb,
                name: `提取颜色 ${index + 1}`,
                usage: '自动识别'
            });
        });

        // 重新渲染颜色显示
        this.refreshColorsDisplay(figureIndex);
        
        if (window.uiComponents) {
            uiComponents.showCopyToast(`已应用 ${figureData.colors.length} 个提取的颜色`);
        }
    }

    // RGB转HEX
    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    // 添加颜色到显示区域
    addColorToDisplay(figureIndex, colorIndex, colorData) {
        const container = document.getElementById(`colorsContainer_${figureIndex}`);
        if (!container) return;

        const colorHtml = `
            <div class="color-item border border-theme rounded-lg p-3" data-color-index="${colorIndex}">
                <div class="flex items-center space-x-3 mb-3">
                    <input type="color" value="${colorData.hex}" 
                           onchange="articleEditor.updateColor(${figureIndex}, ${colorIndex}, 'hex', this.value)"
                           class="w-12 h-12 border border-theme rounded cursor-pointer">
                    <div class="flex-1">
                        <input type="text" placeholder="颜色名称" value="${colorData.name}"
                               onchange="articleEditor.updateColor(${figureIndex}, ${colorIndex}, 'name', this.value)"
                               class="w-full p-2 border border-theme rounded bg-theme-primary text-theme-primary text-sm mb-2">
                        <input type="text" placeholder="用途说明" value="${colorData.usage}"
                               onchange="articleEditor.updateColor(${figureIndex}, ${colorIndex}, 'usage', this.value)"
                               class="w-full p-2 border border-theme rounded bg-theme-primary text-theme-primary text-sm">
                    </div>
                    <button type="button" onclick="articleEditor.removeColor(${figureIndex}, ${colorIndex})" 
                            class="text-red-500 hover:text-red-700 transition-colors p-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7"></path>
                        </svg>
                    </button>
                </div>
                <div class="text-xs text-theme-tertiary font-mono">${colorData.hex} • ${colorData.rgb}</div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', colorHtml);
    }

    // 移除图表
    removeFigure(figureIndex) {
        const figureElement = document.querySelector(`[data-figure-index="${figureIndex}"]`);
        if (figureElement) {
            figureElement.remove();
        }

        // 从数据中移除
        this.figuresData = this.figuresData.filter(fig => fig.index !== figureIndex);
        
        // 清理预览URL
        if (this.previewImageUrls[figureIndex]) {
            URL.revokeObjectURL(this.previewImageUrls[figureIndex]);
            delete this.previewImageUrls[figureIndex];
        }
    }

    // 更新图表数据
    updateFigureData(figureIndex, field, value) {
        const figureData = this.figuresData.find(fig => fig.index === figureIndex);
        if (figureData) {
            figureData[field] = value;
        }
    }

    // 添加颜色
    addColor(figureIndex) {
        const container = document.getElementById(`colorsContainer_${figureIndex}`);
        if (!container) return;

        const figureData = this.figuresData.find(fig => fig.index === figureIndex);
        if (!figureData) return;

        const colorIndex = figureData.colors.length;
        const colorData = {
            hex: '#1f77b4',
            rgb: 'rgb(31, 119, 180)',
            name: '',
            usage: ''
        };

        figureData.colors.push(colorData);
        this.addColorToDisplay(figureIndex, colorIndex, colorData);
    }

    // 移除颜色
    removeColor(figureIndex, colorIndex) {
        const figureData = this.figuresData.find(fig => fig.index === figureIndex);
        if (!figureData || figureData.colors.length <= 1) return;

        figureData.colors.splice(colorIndex, 1);
        this.refreshColorsDisplay(figureIndex);
    }

    // 更新颜色数据
    updateColor(figureIndex, colorIndex, field, value) {
        const figureData = this.figuresData.find(fig => fig.index === figureIndex);
        if (!figureData || !figureData.colors[colorIndex]) return;

        if (field === 'hex') {
            figureData.colors[colorIndex].hex = value;
            // 同时更新RGB值
            const rgb = ColorUtils.hexToRgb(value);
            if (rgb) {
                figureData.colors[colorIndex].rgb = `rgb(${rgb.join(', ')})`;
                // 更新显示
                const colorItem = document.querySelector(`[data-figure-index="${figureIndex}"] [data-color-index="${colorIndex}"]`);
                if (colorItem) {
                    const rgbDisplay = colorItem.querySelector('.font-mono');
                    if (rgbDisplay) {
                        rgbDisplay.textContent = `${value} • ${figureData.colors[colorIndex].rgb}`;
                    }
                }
            }
        } else {
            figureData.colors[colorIndex][field] = value;
        }
    }

    // 刷新颜色显示
    refreshColorsDisplay(figureIndex) {
        const container = document.getElementById(`colorsContainer_${figureIndex}`);
        const figureData = this.figuresData.find(fig => fig.index === figureIndex);
        
        if (!container || !figureData) return;

        container.innerHTML = '';
        figureData.colors.forEach((color, index) => {
            this.addColorToDisplay(figureIndex, index, color);
        });
    }

    // 显示添加领域模态框
    showAddFieldModal() {
        document.getElementById('addFieldModal').classList.remove('hidden');
    }

    // 关闭添加领域模态框
    closeAddFieldModal() {
        document.getElementById('addFieldModal').classList.add('hidden');
        document.getElementById('newFieldName').value = '';
        document.getElementById('newFieldIcon').value = '';
        document.getElementById('newFieldDescription').value = '';
    }

    // 添加新领域
    addNewField(event) {
        event.preventDefault();
        
        const name = document.getElementById('newFieldName').value.trim();
        const icon = document.getElementById('newFieldIcon').value.trim() || '📚';
        const description = document.getElementById('newFieldDescription').value.trim();

        if (!name) {
            alert('请输入领域名称');
            return;
        }

        // 生成唯一的key
        const key = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        
        // 检查是否已存在
        const fields = dataManager.getFields();
        if (fields[key]) {
            alert('该领域已存在');
            return;
        }

        // 添加新领域（按照当前数据结构）
        const newField = {
            name,
            icon,
            description: description || `${name}相关研究`,
            keywords: []
        };

        dataManager.addField(key, newField);
        
        // 刷新选项
        this.populateFields();
        this.populateJournalFieldOptions();
        
        // 自动选中新添加的领域
        document.getElementById('fieldSelect').value = key;
        this.updateJournals();
        
        this.closeAddFieldModal();
        
        if (window.uiComponents) {
            uiComponents.showCopyToast(`新领域"${name}"已添加`);
        }
    }

    // 显示添加期刊模态框
    showAddJournalModal() {
        // 填充领域选项
        this.populateJournalFieldOptions();
        document.getElementById('addJournalModal').classList.remove('hidden');
    }

    // 关闭添加期刊模态框
    closeAddJournalModal() {
        document.getElementById('addJournalModal').classList.add('hidden');
        // 重置期刊表单
        document.getElementById('newJournalName').value = '';
        document.getElementById('newJournalField').value = '';
        document.getElementById('newJournalColor').value = '#2563eb';
        document.getElementById('newJournalColorText').value = '#2563eb';
    }

    // 填充期刊模态框中的领域选项
    populateJournalFieldOptions() {
        const select = document.getElementById('newJournalField');
        if (!select) return;

        const fields = dataManager.getFields();
        select.innerHTML = '<option value="">请选择领域</option>';
        
        Object.entries(fields).forEach(([key, field]) => {
            if (key !== 'all') {
                select.innerHTML += `<option value="${key}">${field.name}</option>`;
            }
        });
    }

    // 添加新期刊
    addNewJournal(event) {
        event.preventDefault();
        
        const name = document.getElementById('newJournalName').value.trim();
        const field = document.getElementById('newJournalField').value;
        const color = document.getElementById('newJournalColor').value;

        if (!name || !field) {
            alert('请填写期刊名称和所属领域');
            return;
        }

        // 生成唯一的key
        const key = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        
        // 检查是否已存在
        const journals = dataManager.getJournals();
        if (journals[key]) {
            alert('该期刊已存在');
            return;
        }

        // 添加新期刊（只包含必要的三个字段）
        const newJournal = {
            name,
            color,
            field
        };

        dataManager.addJournal(key, newJournal);
        
        // 刷新选项
        this.updateJournals();
        
        // 自动选中新添加的期刊
        document.getElementById('journalSelect').value = key;
        
        this.closeAddJournalModal();
        
        if (window.uiComponents) {
            uiComponents.showCopyToast(`新期刊"${name}"已添加`);
        }
    }

    // 预览文章
    previewArticle() {
        const articleData = this.collectFormData();
        if (!articleData) return;

        // 简单的预览功能
        const previewWindow = window.open('', '_blank', 'width=800,height=600');
        previewWindow.document.write(`
            <html>
            <head>
                <title>文章预览 - ${articleData.title}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                    .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                    .figure { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
                    .colors { display: flex; gap: 10px; margin: 10px 0; }
                    .color { width: 30px; height: 30px; border-radius: 4px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${articleData.title}</h1>
                    <p><strong>作者:</strong> ${articleData.authors}</p>
                    <p><strong>期刊:</strong> ${articleData.journal} (${articleData.year})</p>
                    <p><strong>DOI:</strong> ${articleData.doi}</p>
                    <p><strong>标签:</strong> ${articleData.tags.join(', ')}</p>
                </div>
                
                <h2>图表配色 (${articleData.figures.length}个)</h2>
                ${articleData.figures.map((fig, i) => `
                    <div class="figure">
                        <h3>${fig.name}</h3>
                        <p>${fig.description}</p>
                        <p><strong>类型:</strong> ${fig.figure_type}</p>
                        <div class="colors">
                            ${fig.colors.map(color => `
                                <div class="color" style="background-color: ${color.hex}" title="${color.name}: ${color.usage}"></div>
                            `).join('')}
                        </div>
                        <p><strong>颜色数量:</strong> ${fig.colors.length}</p>
                    </div>
                `).join('')}
            </body>
            </html>
        `);
        previewWindow.document.close();
    }

    // 重置表单
    resetForm() {
        if (confirm('确定要重置表单吗？所有已填写的内容将丢失。')) {
            document.getElementById('articleForm').reset();
            this.figuresData = [];
            this.currentFigureIndex = 0;
            document.getElementById('figuresContainer').innerHTML = '';
            
            // 清理预览图片
            this.previewImageUrls.forEach(url => URL.revokeObjectURL(url));
            this.previewImageUrls = [];
            
            this.addFigure(); // 重新添加一个默认图表
        }
    }

    // 收集表单数据
    collectFormData() {
        // 验证基本信息
        const title = document.getElementById('titleInput').value.trim();
        const authors = document.getElementById('authorsInput').value.trim();
        const journal = document.getElementById('journalSelect').value;
        const field = document.getElementById('fieldSelect').value;
        const year = document.getElementById('yearSelect').value;
        const doi = document.getElementById('doiInput').value.trim();

        if (!title || !authors || !journal || !field || !year || !doi) {
            alert('请填写所有必填的基本信息');
            return null;
        }

        // 验证图表数据
        const validFigures = this.figuresData.filter(fig => {
            return fig.name && fig.image_file && fig.colors.length > 0 && 
                   fig.colors.every(color => color.name && color.usage);
        });

        if (validFigures.length === 0) {
            alert('请至少添加一个完整的图表（包含名称、图片和颜色信息）');
            return null;
        }

        // 获取标签
        const tagsInput = document.getElementById('tagsInput').value.trim();
        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

        return {
            title,
            authors,
            journal,
            field,
            year,
            doi,
            tags,
            figures: validFigures
        };
    }

    // 生成图片文件名
    generateImageFileName(articleId, figureIndex, originalFileName) {
        const extension = originalFileName.split('.').pop().toLowerCase();
        return `article_${articleId}_fig_${figureIndex + 1}.${extension}`;
    }

    // 提交表单
    async submitForm(event) {
        event.preventDefault();
        
        const articleData = this.collectFormData();
        if (!articleData) return;

        try {
            // 显示保存状态
            const submitBtn = event.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '保存中...';
            submitBtn.disabled = true;

            // 获取新的文章ID
            const articles = dataManager.getArticles();
            const newArticleId = Math.max(...articles.map(a => a.id), 0) + 1;

            // 处理图片文件
            const processedFigures = [];
            for (let i = 0; i < articleData.figures.length; i++) {
                const figure = articleData.figures[i];
                
                // 生成图片文件名
                const imageName = this.generateImageFileName(newArticleId, i, figure.image_file.name);
                const imagePath = `data/images/${imageName}`;
                
                // 模拟保存图片到服务器/本地
                await this.saveImageFile(figure.image_file, imageName);
                
                // 构建图表数据（严格按照当前数据结构）
                const processedFigure = {
                    id: `fig_${newArticleId}_${i + 1}`,
                    name: figure.name,
                    description: figure.description,
                    figure_type: figure.figure_type,
                    image_path: imagePath,
                    colors: figure.colors.map(color => ({
                        hex: color.hex,
                        rgb: color.rgb,
                        name: color.name,
                        usage: color.usage
                    }))
                };
                
                processedFigures.push(processedFigure);
            }

            // 构建完整的文章数据（严格按照当前数据结构）
            const newArticle = {
                id: newArticleId,
                journal: articleData.journal,
                year: articleData.year,
                field: articleData.field,
                title: articleData.title,
                authors: articleData.authors,
                doi: articleData.doi,
                tags: articleData.tags,
                figures: processedFigures
            };

            // 添加到数据管理器
            dataManager.addArticle(newArticle);

            // 恢复按钮状态
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;

            // 显示成功消息
            if (window.uiComponents) {
                uiComponents.showCopyToast('文章保存成功！');
            }

            // 询问是否查看新添加的文章
            if (confirm('文章保存成功！是否立即查看？')) {
                // 切换到主视图并刷新
                if (window.navigationManager) {
                    navigationManager.showMainView();
                    // 刷新文章列表
                    setTimeout(() => {
                        if (window.uiComponents) {
                            uiComponents.renderArticles();
                            uiComponents.renderYearFiltersAdvanced(); // 添加这行：重新渲染年份筛选
                            uiComponents.renderFieldsList(); // 同时更新领域列表
                        }
                    }, 100);
                }
            }

        } catch (error) {
            console.error('保存文章失败:', error);
            alert('保存文章时发生错误，请重试。');
            
            // 恢复按钮状态
            const submitBtn = event.target.querySelector('button[type="submit"]');
            submitBtn.textContent = '保存文章';
            submitBtn.disabled = false;
        }
    }

    // 模拟保存图片文件
    async saveImageFile(file, fileName) {
        return new Promise((resolve) => {
            // 在实际应用中，这里应该是上传到服务器或保存到本地文件系统
            // 现在我们模拟这个过程
            console.log(`模拟保存图片: ${fileName}`, file);
            
            // 创建一个临时URL用于显示（实际应用中不需要）
            const tempUrl = URL.createObjectURL(file);
            this.uploadedImages.push({
                fileName,
                tempUrl,
                file
            });
            
            setTimeout(() => resolve(), 100);
        });
    }

    // 显示编辑器
    show() {
        if (window.navigationManager) {
            navigationManager.showEditorView();
        }
        this.init();
    }
}

// 创建全局文章编辑器实例
const articleEditor = new ArticleEditor();