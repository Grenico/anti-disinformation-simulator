import { defineStore } from 'pinia';
import type { Article, GameState, Record } from '../types';

const STORAGE_KEY = 'anti-disinformation-simulator-progress';
const SAVES_KEY = 'anti-disinformation-simulator-saves';

interface SaveData {
  slot: number;
  timestamp: number;
  currentDay: number;
  currentIndex: number;
  completedCount: number;
  dailyScore: number;
  totalSalary: number;
  todayRecords: Record[];
}

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    currentDay: 1,
    currentIndex: 0,
    completedCount: 0,
    dailyScore: 0,
    totalSalary: 0, // 累计工资（存款）
    todayRecords: [],
    selectedFlaws: [],
    currentArticle: null,
    articles: [],
    settings: {
      muted: false,
    },
    showSpecialEvent: false,
    specialEventData: null,
    departmentPenaltyOrBonus: null as { type: 'penalty' | 'bonus'; amount: number } | null,
  }),

  getters: {
    isGameCompleted(): boolean {
      return this.completedCount >= 6;
    },
    totalScore(): number {
      return this.dailyScore;
    },
    isGameEnd(): boolean {
      return this.currentDay === 10;
    },
  },

  actions: {
    async loadArticles(day: number) {
      try {
        const articles: Article[] = [];
        for (let i = 1; i<= 6; i++) {
          const response = await fetch(`/articles/day${day}/article${i}.json`);
          const article = await response.json();
          articles.push(article);
        }
        this.articles = articles;
        this.currentArticle = articles[this.currentIndex];
      } catch (error) {
        console.error('加载文章失败:', error);
        throw error;
      }
    },

    loadNextArticle() {
      if (this.currentIndex< 5) {
        this.currentIndex++;
        this.currentArticle = this.articles[this.currentIndex];
        this.selectedFlaws = [];
      } else {
        this.completedCount = 6;
        
        // 在完成所有文章时计算部门处罚/奖励
        if (this.currentDay === 2) {
          setTimeout(() =>{
            const stardustArticle = this.articles.find(article => article.author.name === '星尘时评');
            if (stardustArticle) {
              const stardustRecord = this.todayRecords.find(record => record.articleId === stardustArticle.id);
              if (stardustRecord) {
                if (stardustRecord.userAction === 'pass') {
                  // 通过星尘时评文章，获得部门奖励
                  this.departmentPenaltyOrBonus = { type: 'bonus', amount: 100 };
                } else {
                  // 退回或枪毙星尘时评文章，受到部门处罚
                  this.departmentPenaltyOrBonus = { type: 'penalty', amount: 100 };
                }
              }
            }
          }, 100);
        }
      }
    },

    recordRuling(action: 'pass' | 'revise' | 'report') {
      if (!this.currentArticle) return;

      const isCorrect = action === this.currentArticle.expectedAction;
      let scoreChange = 0;

      if (isCorrect) {
        switch (action) {
          case 'pass':
            scoreChange = 50;
            break;
          case 'revise':
            scoreChange = 40;
            break;
          case 'report':
            scoreChange = 60;
            break;
        }
      } else {
        // 误判正确内容，统一惩罚-40￥
        scoreChange = -40;
      }

      const record: Record = {
        articleId: this.currentArticle.id,
        userAction: action,
        isCorrect,
        scoreChange,
        selectedFlaws: [...this.selectedFlaws],
      };

      this.todayRecords.push(record);
      this.dailyScore += scoreChange;
      this.saveProgress();
    },

    toggleFlaw(flaw: string) {
      const index = this.selectedFlaws.indexOf(flaw);
      if (index >-1) {
        this.selectedFlaws.splice(index, 1);
      } else {
        this.selectedFlaws.push(flaw);

        if (flaw === '一切正常') {
          const otherArgs = ['缺乏信息来源', '信息来源不可靠', '断章取义'];
          otherArgs.forEach(arg => {
            const idx = this.selectedFlaws.indexOf(arg);
            if (idx > -1) this.selectedFlaws.splice(idx, 1);
          });
        }

        if (flaw === '没有问题') {
          const otherLogic = ['前提出错', '前提与结论无关', '推理太跳跃'];
          otherLogic.forEach(logic => {
            const idx = this.selectedFlaws.indexOf(logic);
            if (idx > -1) this.selectedFlaws.splice(idx, 1);
          });
        }
      }
    },

    async startNewGame() {
      this.currentDay = 1;
      this.currentIndex = 0;
      this.completedCount = 0;
      this.dailyScore = 0;
      this.totalSalary = 0;
      this.todayRecords = [];
      this.selectedFlaws = [];
      this.showSpecialEvent = false;
      this.specialEventData = null;
      this.departmentPenaltyOrBonus = null;
      await this.loadArticles(1);
      this.saveProgress();
      window.dispatchEvent(new CustomEvent('game-loaded'));
    },

    loadProgress() {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const progress = JSON.parse(saved);
        this.currentDay = typeof progress.currentDay === 'number' ? progress.currentDay : 1;
        this.currentIndex = typeof progress.currentIndex === 'number' ? progress.currentIndex : 0;
        this.completedCount = typeof progress.completedCount === 'number' ? progress.completedCount : 0;
        this.dailyScore = typeof progress.dailyScore === 'number' ? progress.dailyScore : 0;
        this.totalSalary = typeof progress.totalSalary === 'number' ? progress.totalSalary : 0;
        this.todayRecords = progress.todayRecords || [];
        this.settings = progress.settings || { muted: false };
        this.showSpecialEvent = progress.showSpecialEvent || false;
        this.specialEventData = progress.specialEventData || null;
        this.departmentPenaltyOrBonus = progress.departmentPenaltyOrBonus || null;
        this.loadArticles(this.currentDay);
      } else {
        this.startNewGame();
      }
    },

    saveProgress(slot?: number) {
      const progress = {
        currentDay: this.currentDay,
        currentIndex: this.currentIndex,
        completedCount: this.completedCount,
        dailyScore: this.dailyScore,
        totalSalary: this.totalSalary,
        todayRecords: this.todayRecords,
        settings: this.settings,
        showSpecialEvent: this.showSpecialEvent,
        specialEventData: this.specialEventData,
        departmentPenaltyOrBonus: this.departmentPenaltyOrBonus,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));

      // 如果没有指定槽位，执行自动存档（槽位1）
      if (slot === undefined) {
        const saves: SaveData[] = JSON.parse(localStorage.getItem(SAVES_KEY) || '[]');
        const autoSaveSlot = saves.find(s => s.slot === 1);
        if (autoSaveSlot) {
          autoSaveSlot.timestamp = Date.now();
          autoSaveSlot.currentDay = this.currentDay;
          autoSaveSlot.currentIndex = this.currentIndex;
          autoSaveSlot.completedCount = this.completedCount;
          autoSaveSlot.dailyScore = this.dailyScore;
          autoSaveSlot.totalSalary = this.totalSalary;
          autoSaveSlot.todayRecords = [...this.todayRecords];
        } else {
          saves.push({
            slot: 1,
            timestamp: Date.now(),
            currentDay: this.currentDay,
            currentIndex: this.currentIndex,
            completedCount: this.completedCount,
            dailyScore: this.dailyScore,
            totalSalary: this.totalSalary,
            todayRecords: [...this.todayRecords],
          });
        }
        localStorage.setItem(SAVES_KEY, JSON.stringify(saves));
      } else {
        // 手动存档到指定槽位
        const saves: SaveData[] = JSON.parse(localStorage.getItem(SAVES_KEY) || '[]');
        const existingSave = saves.find(s => s.slot === slot);
        if (existingSave) {
          existingSave.timestamp = Date.now();
          existingSave.currentDay = this.currentDay;
          existingSave.currentIndex = this.currentIndex;
          existingSave.completedCount = this.completedCount;
          existingSave.dailyScore = this.dailyScore;
          existingSave.totalSalary = this.totalSalary;
          existingSave.todayRecords = [...this.todayRecords];
        } else {
          saves.push({
            slot: slot,
            timestamp: Date.now(),
            currentDay: this.currentDay,
            currentIndex: this.currentIndex,
            completedCount: this.completedCount,
            dailyScore: this.dailyScore,
            totalSalary: this.totalSalary,
            todayRecords: [...this.todayRecords],
          });
        }
        localStorage.setItem(SAVES_KEY, JSON.stringify(saves));
      }
    },

    getSaves(): SaveData[] {
      return JSON.parse(localStorage.getItem(SAVES_KEY) || '[]');
    },

    async loadSave(slot: number) {
      const saves: SaveData[] = JSON.parse(localStorage.getItem(SAVES_KEY) || '[]');
      const save = saves.find(s => s.slot === slot);
      if (save) {
        this.currentDay = save.currentDay;
        this.currentIndex = save.currentIndex;
        this.completedCount = save.completedCount;
        this.dailyScore = save.dailyScore;
        this.totalSalary = save.totalSalary;
        this.todayRecords = [...save.todayRecords];
        this.selectedFlaws = [];
        await this.loadArticles(this.currentDay);
        window.dispatchEvent(new CustomEvent('game-loaded'));
      }
    },

    async nextDay(dailyIncome: number = 0) {
      // 将当日工资累加到累计工资中
      this.totalSalary += Number(dailyIncome);
      
      // 应用部门处罚/奖励到总工资
      if (this.departmentPenaltyOrBonus) {
        if (this.departmentPenaltyOrBonus.type === 'bonus') {
          this.totalSalary += Number(this.departmentPenaltyOrBonus.amount);
        } else {
          this.totalSalary -= Number(this.departmentPenaltyOrBonus.amount);
        }
      }
      
      // 如果是第9天，先保存第9天开头的状态，然后进入第10天（结局）
      if (this.currentDay === 9) {
        // 保存第9天开头的状态（用于存档）
        const day9Progress = {
          currentDay: 9,
          currentIndex: 0,
          completedCount: 0,
          dailyScore: 0,
          totalSalary: this.totalSalary,
          todayRecords: [],
          selectedFlaws: [],
          departmentPenaltyOrBonus: null,
          settings: this.settings,
          showSpecialEvent: false,
          specialEventData: null
        };
        localStorage.setItem('anti-disinformation-simulator', JSON.stringify(day9Progress));
        
        // 进入第10天触发结局
        this.currentDay++;
        this.currentIndex = 0;
        this.completedCount = 0;
        this.dailyScore = 0;
        this.todayRecords = [];
        this.selectedFlaws = [];
        this.departmentPenaltyOrBonus = null;
      } else if (this.currentDay< 9) {
        this.currentDay++;
        this.currentIndex = 0;
        this.completedCount = 0;
        this.dailyScore = 0;
        this.todayRecords = [];
        this.selectedFlaws = [];
        this.departmentPenaltyOrBonus = null;
        
        // 先检查是否需要显示特殊事件
        this.checkSpecialEvent();
        
        await this.loadArticles(this.currentDay);
        this.saveProgress();
      }
    },
    
    checkSpecialEvent() {
      const specialEvents: { [key: number]: { title: string; content: string } } = {
        2: {
          title: "同事 艾丽丝",
          content: "主管说<span style=\"font-weight: bold !important; color: #0aaade !important;\">星尘时评</span>的内容能给平台带来流量，要求一律通过。你在今天的审查中要注意。"
        },
        4: {
          title: "今日快讯",
          content: "据辉光联邦武装部有关人员透露，辉光有计划对迪兰国进行军事打击。该消息得到了辉光联邦新闻发言人证实。但他表示，辉光仍不会放弃谈判和协商的可能性。"
        },
        5: {
          title: "今日快讯",
          content: "今日，咚达各界在曙光城英雄广场隆重集会，纪念曙光城战役胜利74周年。曙光城战役发生于1990年春，当时，罂帝国侵略军集结重兵，企图一举攻占咚达曙光城。在敌众我寡、装备悬殊的情况下，咚达军民经过七天七夜激战，成功击退侵略者。"
        },
        7: {
          title: "妈妈",
          content: "我寄给你的水果收到了吗？程序员天天看屏幕，很耗精神的！一定要把这些吃了，对身体好。平时要按时吃饭，早点休息。"
        }
      };
      
      const event = specialEvents[this.currentDay];
      if (event) {
        this.showSpecialEvent = true;
        this.specialEventData = event;
      }
    },
    
    closeSpecialEvent() {
      this.showSpecialEvent = false;
      this.specialEventData = null;
    },

    toggleMute() {
      this.settings.muted = !this.settings.muted;
      this.saveProgress();
    },
  },
});