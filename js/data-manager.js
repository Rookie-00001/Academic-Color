// 数据管理模块
class DataManager {
    constructor() {
        this.fields = {};
        this.journals = {};
        this.articles = [];
        this.recommendedPalettes = [];
        this.isDataLoaded = false;
    }

    // 初始化数据
    async init() {
        try {
            await Promise.all([
                this.loadFields(),
                this.loadJournals(),
                this.loadArticles(),
                this.loadRecommendedPalettes()
            ]);
            this.isDataLoaded = true;
            console.log('数据加载完成');
        } catch (error) {
            console.error('数据加载失败:', error);
            // 使用默认数据
            this.loadDefaultData();
        }
    }

    // 加载研究领域数据
    async loadFields() {
        try {
            const response = await fetch('data/fields.json');
            this.fields = await response.json();
        } catch (error) {
            console.error('加载领域数据失败:', error);
            this.fields = this.getDefaultFields();
        }
    }

    // 加载期刊数据
    async loadJournals() {
        try {
            const response = await fetch('data/journals.json');
            this.journals = await response.json();
        } catch (error) {
            console.error('加载期刊数据失败:', error);
            this.journals = this.getDefaultJournals();
        }
    }

    // 加载文章数据
    async loadArticles() {
        try {
            const response = await fetch('data/articles.json');
            this.articles = await response.json();
        } catch (error) {
            console.error('加载文章数据失败:', error);
            this.articles = this.getDefaultArticles();
        }
    }

    // 加载推荐配色数据
    async loadRecommendedPalettes() {
        try {
            const response = await fetch('data/recommended-palettes.json');
            this.recommendedPalettes = await response.json();
        } catch (error) {
            console.error('加载推荐配色数据失败:', error);
            this.recommendedPalettes = this.getDefaultRecommendedPalettes();
        }
    }

    // 获取所有研究领域
    getFields() {
        return this.fields;
    }

    // 新增：获取指定领域的子领域
    getSubfieldsByField(fieldKey) {
        const field = this.fields[fieldKey];
        return field && field.subcategories ? field.subcategories : {};
    }

    // 获取指定领域的期刊
    getJournalsByField(fieldKey) {
        return Object.entries(this.journals).filter(([key, journal]) => 
            journal.field === fieldKey
        );
    }

    // 新增：获取指定子领域的期刊
    getJournalsBySubfield(fieldKey, subfieldKey) {
        return Object.entries(this.journals).filter(([key, journal]) => 
            journal.field === fieldKey && journal.subfield === subfieldKey
        );
    }

    // 获取所有期刊
    getJournals() {
        return this.journals;
    }

    // 获取文章数据
    getArticles() {
        return this.articles;
    }

    // 根据ID获取文章
    getArticleById(id) {
        return this.articles.find(article => article.id === id);
    }

    // 新增：根据领域筛选文章
    getArticlesByField(fieldKey) {
        return this.articles.filter(article => article.field === fieldKey);
    }

    // 新增：根据子领域筛选文章
    getArticlesBySubfield(fieldKey, subfieldKey) {
        return this.articles.filter(article => 
            article.field === fieldKey && article.subfield === subfieldKey
        );
    }

    // 获取推荐配色
    getRecommendedPalettes() {
        return this.recommendedPalettes;
    }

    // 添加新文章（用于后期更新）
    addArticle(articleData) {
        const newId = Math.max(...this.articles.map(a => a.id), 0) + 1;
        const article = { ...articleData, id: newId };
        this.articles.push(article);
        this.saveArticlesToLocal();
        return article;
    }

    // 更新文章数据
    updateArticle(id, updateData) {
        const index = this.articles.findIndex(article => article.id === id);
        if (index !== -1) {
            this.articles[index] = { ...this.articles[index], ...updateData };
            this.saveArticlesToLocal();
            return this.articles[index];
        }
        return null;
    }

    // 删除文章
    deleteArticle(id) {
        const index = this.articles.findIndex(article => article.id === id);
        if (index !== -1) {
            const deleted = this.articles.splice(index, 1)[0];
            this.saveArticlesToLocal();
            return deleted;
        }
        return null;
    }

    // 添加期刊（修改以支持子领域）
    addJournal(key, journalData) {
        // 验证必要字段
        if (!journalData.name || !journalData.color || !journalData.field) {
            throw new Error('期刊数据缺少必要字段');
        }

        this.journals[key] = {
            name: journalData.name,
            color: journalData.color,
            field: journalData.field,
            subfield: journalData.subfield || null // 支持子领域
        };
        
        // 在实际应用中，这里应该保存到后端
        console.log('新期刊已添加:', key, this.journals[key]);
    }

    // 添加新领域（修改以支持子领域）
    addField(fieldKey, fieldData) {
        this.fields[fieldKey] = fieldData;
        this.saveFieldsToLocal();
    }

    // 新增：添加子领域
    addSubfield(fieldKey, subfieldKey, subfieldData) {
        if (!this.fields[fieldKey]) {
            throw new Error('父领域不存在');
        }

        if (!this.fields[fieldKey].subcategories) {
            this.fields[fieldKey].subcategories = {};
        }

        this.fields[fieldKey].subcategories[subfieldKey] = subfieldData;
        this.saveFieldsToLocal();
    }

    // 保存数据到本地存储
    saveArticlesToLocal() {
        localStorage.setItem('academic_articles', JSON.stringify(this.articles));
    }

    saveJournalsToLocal() {
        localStorage.setItem('academic_journals', JSON.stringify(this.journals));
    }

    saveFieldsToLocal() {
        localStorage.setItem('academic_fields', JSON.stringify(this.fields));
    }

    // 从本地存储加载数据
    loadFromLocal() {
        const articles = localStorage.getItem('academic_articles');
        const journals = localStorage.getItem('academic_journals');
        const fields = localStorage.getItem('academic_fields');

        if (articles) this.articles = JSON.parse(articles);
        if (journals) this.journals = JSON.parse(journals);
        if (fields) this.fields = JSON.parse(fields);
    }

    // 导出数据
    exportData() {
        return {
            fields: this.fields,
            journals: this.journals,
            articles: this.articles,
            recommendedPalettes: this.recommendedPalettes,
            exportDate: new Date().toISOString(),
            version: '2.0.0' // 更新版本号以反映分层结构
        };
    }

    // 导入数据
    importData(data) {
        try {
            if (data.fields) this.fields = data.fields;
            if (data.journals) this.journals = data.journals;
            if (data.articles) this.articles = data.articles;
            if (data.recommendedPalettes) this.recommendedPalettes = data.recommendedPalettes;
            
            // 保存到本地
            this.saveArticlesToLocal();
            this.saveJournalsToLocal();
            this.saveFieldsToLocal();
            
            return true;
        } catch (error) {
            console.error('导入数据失败:', error);
            return false;
        }
    }

    // 获取统计信息（修改以支持子领域统计）
    getStatistics() {
        const totalArticles = this.articles.length;
        const fieldStats = {};
        const subfieldStats = {};
        const journalStats = {};
        const yearStats = {};

        this.articles.forEach(article => {
            // 统计主领域
            fieldStats[article.field] = (fieldStats[article.field] || 0) + 1;
            
            // 统计子领域
            if (article.subfield) {
                const subfieldKey = `${article.field}.${article.subfield}`;
                subfieldStats[subfieldKey] = (subfieldStats[subfieldKey] || 0) + 1;
            }
            
            // 统计期刊
            journalStats[article.journal] = (journalStats[article.journal] || 0) + 1;
            
            // 统计年份
            yearStats[article.year] = (yearStats[article.year] || 0) + 1;
        });

        return {
            totalArticles,
            totalFields: Object.keys(this.fields).length - 1, // 排除 'all'
            totalJournals: Object.keys(this.journals).length,
            fieldStats,
            subfieldStats, // 新增子领域统计
            journalStats,
            yearStats,
            lastUpdated: new Date().toISOString()
        };
    }

    // 搜索文章（修改以支持子领域搜索）
    searchArticles(query, filters = {}) {
        let results = this.articles;

        // 文本搜索
        if (query && query.trim()) {
            const searchTerm = query.toLowerCase();
            results = results.filter(article => 
                article.title.toLowerCase().includes(searchTerm) ||
                article.authors.toLowerCase().includes(searchTerm) ||
                article.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
                (article.abstract && article.abstract.toLowerCase().includes(searchTerm))
            );
        }

        // 应用筛选器
        if (filters.field && filters.field !== 'all') {
            results = results.filter(article => article.field === filters.field);
        }

        // 新增：子领域筛选
        if (filters.subfield) {
            results = results.filter(article => article.subfield === filters.subfield);
        }

        if (filters.journal && filters.journal !== 'all') {
            results = results.filter(article => article.journal === filters.journal);
        }

        if (filters.year && filters.year !== 'all') {
            // 支持数字和字符串类型的年份比较
            results = results.filter(article => {
                const articleYear = parseInt(article.year);
                const filterYear = parseInt(filters.year);
                return articleYear === filterYear;
            });
        }

        if (filters.colorCount && filters.colorCount !== 'all') {
            const count = parseInt(filters.colorCount);
            if (filters.colorCount === '6+') {
                results = results.filter(article => 
                    article.figures.some(fig => fig.colors.length >= 6)
                );
            } else if (!isNaN(count)) {
                results = results.filter(article => 
                    article.figures.some(fig => fig.colors.length === count)
                );
            }
        }

        return results;
    }

    // 新增：按年份范围筛选文章
    filterArticlesByYearRange(startYear, endYear) {
        return this.articles.filter(article => {
            const year = parseInt(article.year);
            return year >= startYear && year <= endYear;
        });
    }

    // 新增：按配色数量筛选文章
    filterArticlesByColorCount(count) {
        return this.articles.filter(article => {
            const totalColors = article.figures.reduce((sum, figure) => sum + figure.colors.length, 0);
            
            switch (count) {
                case '3':
                    return totalColors === 3;
                case '4':
                    return totalColors === 4;
                case '5':
                    return totalColors === 5;
                case '6+':
                    return totalColors >= 6;
                default:
                    return true;
            }
        });
    }

    // 默认数据（更新为新的分层结构）
    getDefaultFields() {
        return {
            "all": {
                "name": "全部领域",
                "icon": "📚",
                "description": "包含所有研究领域"
            },
            "natural_science": {
                "name": "自然科学",
                "icon": "☘",
                "description": "基础自然科学研究",
                "subcategories": {
                    "comprehensive": {
                        "name": "综合类",
                        "icon": "🌟",
                        "description": "综合性科学期刊"
                    },
                    "physics": {
                        "name": "物理学",
                        "icon": "⚛️",
                        "description": "物理科学研究"
                    },
                    "biology": {
                        "name": "生物学",
                        "icon": "🐞",
                        "description": "生物学基础研究"
                    },
                    "chemistry": {
                        "name": "化学",
                        "icon": "🔥",
                        "description": "化学相关研究"
                    }
                }
            },
            "engineering_technology": {
                "name": "工程技术",
                "icon": "⚙️",
                "description": "工程技术领域研究",
                "subcategories": {
                    "mechanical_engineering": {
                        "name": "机械工程",
                        "icon": "🔧",
                        "description": "机械工程相关研究"
                    },
                    "computer_science": {
                        "name": "计算机科学",
                        "icon": "💻",
                        "description": "计算机科学与技术"
                    }
                }
            },
            "medical_life_science": {
                "name": "医学与生命科学",
                "icon": "✚",
                "description": "医学和生命科学研究",
                "subcategories": {
                    "clinical_medicine": {
                        "name": "临床医学",
                        "icon": "☊",
                        "description": "临床医学研究"
                    },
                    "basic_medicine": {
                        "name": "基础医学",
                        "icon": "♥",
                        "description": "基础医学研究"
                    }
                }
            },
            "interdisciplinary": {
                "name": "交叉学科",
                "icon": "🔗",
                "description": "跨学科交叉研究",
                "subcategories": {
                    "environmental_science": {
                        "name": "环境科学",
                        "icon": "♻️",
                        "description": "环境与生态研究"
                    },
                    "bioinformatics": {
                        "name": "生物信息学",
                        "icon": "📊",
                        "description": "生物信息学研究"
                    }
                }
            }
        };
    }

    getDefaultJournals() {
        return {
            "nature": {
                "name": "Nature",
                "color": "#2563eb",
                "field": "natural_science",
                "subfield": "comprehensive"
            },
            "science": {
                "name": "Science",
                "color": "#dc2626",
                "field": "natural_science",
                "subfield": "comprehensive"
            },
            "nejm": {
                "name": "NEJM",
                "color": "#7c3aed",
                "field": "medical_life_science",
                "subfield": "clinical_medicine"
            },
            "prl": {
                "name": "Phys. Rev. Lett.",
                "color": "#2563eb",
                "field": "natural_science",
                "subfield": "physics"
            },
            "nature_physics": {
                "name": "Nature Physics",
                "color": "#7c3aed",
                "field": "natural_science",
                "subfield": "physics"
            }
        };
    }

    getDefaultArticles() {
        return [
            {
                id: 1,
                journal: 'nature',
                year: 2024,
                field: 'natural_science',
                subfield: 'comprehensive',
                title: 'Single-cell RNA sequencing reveals cellular heterogeneity',
                authors: 'Smith, J., Johnson, A.',
                doi: '10.1038/s41586-024-07123-4',
                tags: ['single-cell', 'RNA-seq'],
                figures: [
                    {
                        name: 'Figure 2A - UMAP细胞聚类图',
                        colors: [
                            { hex: '#1f77b4', rgb: 'rgb(31, 119, 180)', name: 'Neural Progenitor', usage: '神经前体细胞' },
                            { hex: '#ff7f0e', rgb: 'rgb(255, 127, 14)', name: 'Mesenchymal', usage: '间充质细胞' },
                            { hex: '#2ca02c', rgb: 'rgb(44, 160, 44)', name: 'Differentiated', usage: '已分化细胞' }
                        ]
                    }
                ]
            }
        ];
    }

    getDefaultRecommendedPalettes() {
        return [
            {
                id: 1,
                name: "Nature Inspired",
                colors: ['#2d5a27', '#5cb3a8', '#9bc53d', '#f5de01', '#ff8c00'],
                likes: 234,
                liked: false
            },
            {
                id: 2,
                name: "Medical Research",
                colors: ['#7c3aed', '#dc2626', '#059669', '#f59e0b'],
                likes: 189,
                liked: false
            }
        ];
    }

    // 加载默认数据（当网络请求失败时使用）
    loadDefaultData() {
        this.fields = this.getDefaultFields();
        this.journals = this.getDefaultJournals();
        this.articles = this.getDefaultArticles();
        this.recommendedPalettes = this.getDefaultRecommendedPalettes();
        this.isDataLoaded = true;
    }
}

// 创建全局数据管理器实例
const dataManager = new DataManager();