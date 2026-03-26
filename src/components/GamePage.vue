<template><div class="game-page" :class="{ 'fade-in': isVisible }"><!-- 特殊事件（最高层级） --><SpecialEvent v-if="gameStore.showSpecialEvent && gameStore.specialEventData" 
      :event-title="gameStore.specialEventData.title"
      :event-content="gameStore.specialEventData.content"
    /><div class="welcome-message" :class="{ 'show': showWelcome, 'fade-out': fadeOutWelcome }">欢迎登录星网审核系统</div><div class="top-status" :class="{ 'show': showGamePanel }"><span class="salary-text">存款：{{ gameStore.totalSalary }}￥</span><span class="day-text">第 {{ gameStore.currentDay }} 天</span><div class="settings-container"><button class="settings-button" @click="toggleSettings"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 15.5A3.5 3.5 0 1012 8.5a3.5 3.5 0 000 7z" fill="#aaaaaa"/><path d="M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.39-1.08-.73-1.66-.98l-.37-2.65c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.37 2.65c-.58.25-1.14.59-1.66.98l-2.49-1c-.22-.08-.49 0-.61.22l-2 3.46c-.12.22-.07.49.12.64l2.11 1.65c-.04.32-.07.64-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.39 1.08.73 1.66.98l.37 2.65c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.37-2.65c.58-.25 1.14-.59 1.66-.98l2.49 1c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="#aaaaaa"/></svg></button></div></div><div class="game-layout" :class="{ 'shaking': animationState === 'shaking', 'show': showGamePanel }"><!-- 左侧裁决区 --><div class="tech-panel ruling-panel"><div class="warning-section"><h3>今日话术预警</h3><ul class="fallacies-list"><li v-for="([fallacy, explanation]) in limitedFallacies" :key="fallacy" class="fallacy-item"><span class="fallacy-name">{{ fallacy }}</span><span class="fallacy-explanation">{{ explanation }}</span></li></ul></div><div class="button-section"><div class="button-container">
          <button class="ruling-button pass" @click.stop="rule('pass')" :disabled="!canRule || animationState === 'shooting-mode'">通过</button>
          <button class="ruling-button revise" @click.stop="rule('revise')" :disabled="!canRule || animationState === 'shooting-mode'">退回</button>
          <button class="ruling-button report" @click.stop="animationState === 'shooting-mode' ? endShootingMode() : rule('report')" :disabled="!canRule">{{ reportButtonText }}</button>
        </div><div class="rule-hint" v-if="!canRule">请先在右侧记录你的发现</div></div></div><!-- 中央文章区 --><div class="article-container"><div v-if="isLoading" class="loading-container"><div class="loading-spinner"></div><div class="loading-text">加载新文章中..</div></div><template v-else-if="gameStore.currentArticle"><div class="tech-panel article-display" :class="{ 
        'pass-exit': animationState === 'pass-exit',
        'pass-enter': animationState === 'pass-enter',
        'revise-exit': animationState === 'revise-exit',
        'revise-enter': animationState === 'revise-enter',
        'report-exit': animationState === 'report-exit',
        'shooting-mode': animationState === 'shooting-mode',
        'active': currentContainerIndex === 0
      }" @click="addBulletHole"><div class="author-info"><div class="avatar">{{ gameStore.currentArticle.author.name.charAt(0) }}</div><span class="author-name">{{ gameStore.currentArticle.author.name }}</span></div><h2 class="article-title">{{ gameStore.currentArticle.title }}</h2><div class="article-content" v-html="highlightedContent"></div><!-- 弹孔效果 --><div class="bullet-hole" v-for="(hole, index) in bulletHoles" :key="index" :style="{ left: hole.x + 'px', top: hole.y + 'px' }"></div></div><!-- 第二个文章容器用于动画切换 --><div class="tech-panel article-display" :class="{ 
        'pass-exit': animationState === 'pass-exit',
        'pass-enter': animationState === 'pass-enter',
        'revise-exit': animationState === 'revise-exit',
        'revise-enter': animationState === 'revise-enter',
        'report-exit': animationState === 'report-exit',
        'shooting-mode': animationState === 'shooting-mode',
        'active': currentContainerIndex === 1
      }" @click="addBulletHole"><div class="author-info"><div class="avatar">{{ gameStore.currentArticle.author.name.charAt(0) }}</div><span class="author-name">{{ gameStore.currentArticle.author.name }}</span></div><h2 class="article-title">{{ gameStore.currentArticle.title }}</h2><div class="article-content" v-html="highlightedContent"></div><!-- 弹孔效果 --><div class="bullet-hole" v-for="(hole, index) in bulletHoles" :key="index" :style="{ left: hole.x + 'px', top: hole.y + 'px' }"></div></div></template></div><!-- 右侧工作区 - 笔记本 --><div class="tech-panel workspace-panel"><div class="notebook-button" @click="openWorkspace"><div class="notebook-text">检验清单</div></div></div></div><!-- 工作区模态框 --><div class="modal-overlay" :class="{ 'show': showWorkspace }" @click="closeWorkspace"><div class="close-button" @click="closeWorkspace">×</div><div class="modal-content" @click.stop><h2>检验清单</h2><div class="workspace-content"><div class="section"><h3>检验论据</h3><div class="checkbox-group"><label class="checkbox-item"><input type="checkbox" value="缺乏信息来源" v-model="selectedFlaws" @change="updateFlaws"><span>缺乏信息来源</span></label><label class="checkbox-item"><input type="checkbox" value="信息来源不可靠" v-model="selectedFlaws" @change="updateFlaws"><span>信息来源不可靠</span></label><label class="checkbox-item"><input type="checkbox" value="断章取义" v-model="selectedFlaws" @change="updateFlaws"><span>断章取义</span></label><label class="checkbox-item"><input type="checkbox" value="一切正常" v-model="selectedFlaws" @change="updateFlaws"><span>一切正常</span></label></div></div><div class="section"><h3>逻辑诊断</h3><div class="checkbox-group"><label class="checkbox-item" v-for="(fallacy, index) in logicFallacies" :key="index"><input type="checkbox" :value="fallacy" v-model="selectedFlaws" @change="updateFlaws"><span>{{ fallacy }}</span></label><label class="checkbox-item"><input type="checkbox" value="没有问题" v-model="selectedFlaws" @change="updateFlaws"><span>没有问题</span></label></div></div></div></div></div><!-- 结局弹窗 --><div class="modal-overlay" :class="{ 'show': gameStore.isGameEnd }"><div class="modal-content" @click.stop><h2>星网人事部</h2><div class="ending-content"><p>实习期结束，感谢您对网络环境作出的贡献。</p></div><div class="modal-buttons"><button class="tech-button" @click="quitGame">回到标题页面</button></div></div></div><!-- 结算弹窗 --><div class="modal-overlay" :class="{ 'show': gameStore.isGameCompleted && !gameStore.isGameEnd }"><div class="modal-content" @click.stop><h2>今日总结（第 {{ gameStore.currentDay }} 天）</h2><div class="settlement-content"><div class="settlement-item"><span>清理掉的违规内容：{{ correctReports }}篇</span><span>+{{ correctReports * 60 }}￥</span></div><div class="settlement-item"><span>放过的违规内容：{{ incorrectPasses }}篇</span><span>-{{ incorrectPasses * 40 }}￥</span></div><div class="settlement-item"><span>误判的正确内容：{{ incorrectRevises + incorrectReports }}篇</span><span>-{{ (incorrectRevises + incorrectReports) * 40 }}￥</span></div><div class="settlement-item"><span>通过的正确内容：{{ correctPasses }}篇</span><span>+{{ correctPasses * 50 }}￥</span></div><div class="settlement-item"><span>退回修改的内容：{{ correctRevises }}篇</span><span>+{{ correctRevises * 40 }}￥</span></div><div class="settlement-item"><span>额外奖励（正确识别违规点）：</span><span>+{{ bonusScore }}￥</span></div><div v-if="gameStore.departmentPenaltyOrBonus" class="settlement-item"><span>{{ gameStore.departmentPenaltyOrBonus.type === 'bonus' ? '部门奖励' : '部门处罚' }}：</span><span>{{ gameStore.departmentPenaltyOrBonus.type === 'bonus' ? '+' : '-' }}{{ gameStore.departmentPenaltyOrBonus.amount }}￥</span></div><div class="total-score"><strong>今日收入：{{ correctReports * 60 - incorrectPasses * 40 - (incorrectRevises + incorrectReports) * 40 + correctPasses * 50 + correctRevises * 40 + bonusScore + (gameStore.departmentPenaltyOrBonus ? (gameStore.departmentPenaltyOrBonus.type === 'bonus' ? gameStore.departmentPenaltyOrBonus.amount : -gameStore.departmentPenaltyOrBonus.amount) : 0) }}￥</strong></div>
      </div>
      <div class="modal-buttons">
        <button class="tech-button" @click="openDetailModal">查看明细</button>
        <button class="tech-button" @click="nextDay">进入下一天</button>
      </div></div></div><!-- 明细弹窗 --><div class="modal-overlay" :class="{ 'show': showDetailModal }" @click="closeDetailModal"><div class="modal-content detail-modal" @click.stop><h2>今日审核明细</h2><div class="detail-content" ref="detailContentRef"><div class="detail-item" v-for="(record, index) in gameStore.todayRecords" :key="index"><div class="detail-header"><span class="article-number">文章编号：{{ index + 1 }}</span></div><div class="detail-info"><div class="detail-row"><span class="detail-label">用户操作：</span><span class="detail-value">{{ getActionText(record.userAction) }}</span></div><div class="detail-row"><span class="detail-label">复审结果：</span><span class="detail-value" :class="{ 'correct': getExpectedAction(record) === 'pass', 'incorrect': getExpectedAction(record) !== 'pass' }">{{ getExpectedActionText(record) }}</span></div><div class="detail-row"><span class="detail-label">理由：</span><span class="detail-value">{{ getReviewReason(record) }}</span></div></div></div></div><div class="modal-buttons"><button class="tech-button" @click="closeDetailModal">关闭</button></div></div></div><!-- 设置弹窗 -->
<div class="modal-overlay" :class="{ 'show': showSettings }" @click="toggleSettings">
<div class="close-button" @click.stop="toggleSettings">×</div>
<div class="modal-content" @click.stop>
<h2>设置</h2>
<div class="settings-content">
<div class="setting-item">
<label>音效</label>
<input type="range" min="0" max="100" v-model.number="soundVolume" class="volume-slider">
<span class="volume-value">{{ soundVolume }}%</span>
</div>
<div class="setting-item">
<label>背景音乐</label>
<input type="range" min="0" max="100" v-model.number="musicVolume" class="volume-slider">
<span class="volume-value">{{ musicVolume }}%</span>
</div>
<div class="modal-buttons">
<button class="tech-button" @click="saveAndQuit">保存并退出</button>
</div></div>
</div>
</div><!-- 存档槽位选择弹窗 -->
<div class="modal-overlay" :class="{ 'show': showSaveSlots }" @click="closeSaveSlots">
<div class="close-button" @click.stop="closeSaveSlots">×</div>
<div class="modal-content" @click.stop>
<h2>选择存档槽位</h2>
<div class="save-slots">
<button class="save-slot" v-for="i in 5" :key="i" @click="confirmSave(i)">
<span class="slot-number">存档 {{ i }}</span>
<span class="slot-info" v-if="gameStore.getSaves().find(s => s.slot === i)">
<div class="save-day">第 {{ gameStore.getSaves().find(s => s.slot === i)?.currentDay }} 天</div>
<div class="save-time">{{ formatSlotTime(gameStore.getSaves().find(s => s.slot === i)?.timestamp) }}</div>
<span class="auto-save-label" v-if="i === 1">自动存档</span>
<span class="custom-save-label" v-else>自定义存档</span>
</span>
<span class="slot-empty" v-else>空槽位</span>
</button>
</div>
</div>
</div></div><!-- 引用资料弹窗 --><div class="reference-popup" v-if="showReferencePopup" 
    :style="{ 
      left: popupPosition.x + 'px', 
      top: popupPosition.y + 'px' 
    }"
    @mousedown="startDrag">
  <div class="popup-header">
    <span class="popup-title">资料来源</span>
    <button class="popup-close" @click.stop="closeReferencePopup">×</button>
  </div>
  <div class="popup-content">
    <div class="source-info">
      <strong>信息来源：</strong>{{ referenceData.source }}
    </div>
    <div class="context-info">
      <strong>引用上下文：</strong>
      <p>{{ referenceData.context }}</p>
    </div>
  </div>
</div></template><script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '../stores/gameStore';
import SpecialEvent from './SpecialEvent.vue';

const gameStore = useGameStore();
const showWorkspace = ref(false);
const showSettings = ref(false);
const selectedFlaws = ref<string[]>([]);
const soundVolume = ref(80);
const musicVolume = ref(60);
const isLoading = ref(false);
const isVisible = ref(false);
const showWelcome = ref(false);
const fadeOutWelcome = ref(false);
const showGamePanel = ref(false);
const isInteractive = ref(false);
const showDetailModal = ref(false);
const detailContentRef = ref<HTMLElement | null>(null);
// 引用资料弹窗相关
const showReferencePopup = ref(false);
const referenceData = ref({
  source: '',
  context: ''
});
const popupPosition = ref({
  x: window.innerWidth - 500,
  y: 150
});
const isDragging = ref(false);
const dragOffset = ref({
  x: 0,
  y: 0
});

// 动画状态
const animationState = ref('normal'); // normal, pass-exit, pass-enter, revise-exit, revise-enter, report-exit, shooting-mode
const reportButtonText = ref('枪毙');
const bulletHoles = ref<Array<{x: number, y: number}>>([]);
const currentContainerIndex = ref(0); // 0 or 1，用于切换两个文章容器

// 引用资料数据结构（Day 1）
const referenceDataMap = {
  // Day 1
  'day1-article7': {
    quote: '星城社区实行这个制度后，分类准确率从43%提到81%。',
    source: '咚达环境科学研究院《2064 年星城社区垃圾分类试点评估报告》',
    context: '星城社区自 2063 年 6 月推行"垃圾分类积分制"以来，居民分类准确率由最初的 43%稳步提升，至 2064 年 5 月已达到 81%。该制度通过正向激励有效调动了居民参与热情，目前已在周边五个社区推广。'
  },
  
  // Day 2
  'day2-article7': {
    quote: '咚达通过AI实时调整绿灯时间，使路口饱和度稳定在0.7-0.8的最优区间。系统运行一年后，高峰期拥堵指数下降12%，通行效率提升15%。',
    source: '咚达交通研究中心《智慧交通系统运行一周年评估报告》',
    context: '依托 AI 实时配时优化，系统将路口饱和度控制在 0.7–0.8 的理论最优区间。运营数据显示，一年来中心城区高峰期平均拥堵指数下降 12%，主干道通行效率提升 15%，达到预期设计目标。'
  },
  
  // Day 3
  'day3-article4': {
    quote: '咚达《网络信息管理条例》明确规定“禁止传播谣言和煽动性内容”',
    source: '咚达《网络信息管理条例》第二十三条',
    context: '第二十三条 网络信息内容服务平台应当建立健全用户账号信用管理体系，对发布违法信息、传播谣言、煽动对立等行为的用户，可视情节采取限制功能、暂停更新、关闭账号等措施，并保留证据向有关部门报告。'
  },
  'day3-article2': {
    quote: '医疗事故',
    source: '咚达 B26 市医院《2064 年度医疗质量安全报告》',
    context: '本年度共发生 3 例医疗事故，均为 II 级（轻度）事故，经院方积极处置后患者均恢复良好。事故发生率较上年下降 28%，低于全市平均水平。其中 2 例系因 AI 辅助诊断系统未覆盖的罕见病例导致，院方已组织专项整改。'
  },
  'day3-article3': {
    quote: '根据平台公布的财务数据，“速速”向商户端收取25%-35%的抽成，其中并未为骑手预留社保成本。',
    source: '速速平台《2063 年度社会责任报告》',
    context: '平台向商户收取的技术服务费占订单金额的 25%–35%，该项收入主要用于平台运营、技术研发、客服支持及骑手意外保险与职业伤害保障试点基金。自 2062 年起，平台已为全量骑手投保"新职伤险"，费用由平台全额承担。'
  },
  'day3-article7': {
    quote: '结果显示：AI组急诊误诊率下降28%（3.2% vs 4.5%，p<0.01），平均诊断时间缩短22分钟（p<0.001）。',
    source: '咚达安心医院《AI 辅助诊断系统临床应用评估报告》',
    context: '采用倾向性评分匹配法对比 AI 辅助组（n=1298）与常规组（n=1237），结果显示 AI 组急诊误诊率由 4.5%降至 3.2%（下降 28%，p<0.01），平均诊断时间缩短 22 分钟（p<0.001）。该差异在夜班及节假日期间尤为显著，且未出现因 AI 建议导致的不良事件。'
  },
  
  // Day 4
  'day4-article4': {
    quote: '根据电影产业研究机构的统计，咚达近三年上映的国产影片中，有超过六成经历过送审删改，平均删减时长约12分钟。',
    source: '咚达电影产业研究院《2062-2064 年度国产电影内容审查分析报告》',
    context: '近三年上映的国产故事片中，62.3%曾经历内容修改或删减，平均删减时长约 12 分钟。其中约 80%的修改属于技术性调整（如字幕、时长规范）或分级提示优化，仅 17%涉及核心情节变更。'
  },
  'day4-article5': {
    quote: '数据显示，咚达每年出版的原创长篇小说超过8000部，但能进入主流书店销售的不足10%',
    source: '咚达出版科学研究院《2064 年度图书市场分析报告》',
    context: '2064 年咚达共出版原创长篇小说 8732 种，其中通过实体书店进入主流渠道销售的比例为 9.8%。但同期电子书、有声书等数字渠道销量占比已达 41%，且超过 60%的纸质版首印即被图书馆、农家书屋等公共服务网络采购，实际触达读者比例远高于实体书店上架率。'
  },
  'day4-article5-2': {
    quote: '根据咚达作协的调研，近五年内有超过300位中青年作家因“题材敏感”而选择“自我审查”或放弃出版。',
    source: '咚达作家协会《2059-2064 年青年创作状况调研报告》',
    context: '五年间受访的 1562 位中青年作家中，有 307 人表示曾因题材敏感性而主动调整或搁置创作计划。但其中超过八成认为这种调整属于"创作聚焦"或"更符合主流导向"，仅 51 人（占比 3.3%）认为"限制严重影响了创作自由"。'
  },
  'day4-article6': {
    quote: '根据文化产业研究机构发布的《咚达与樱都国动漫产业对比报告》',
    source: '咚达文化产业研究院《2064 年动漫产业国际竞争力对比研究》',
    context: '报告通过对比咚达与樱都国动漫产业发现：咚达在产量、播放量、衍生品销售额等指标上已超过樱都国，但在题材多元化方面仍存在差距。樱都国面向成年人的动漫占比虽高，但其"深夜档"动漫市场萎缩，商业回报率仅为咚达同类作品的三分之一。'
  },
  
  // Day 5
  'day5-article1': {
    quote: '垃圾分类准确率稳定在78%左右，与咚达相差无几，但居民满意度高达91%。',
    source: '北陆联邦环境署《2064 年度生活垃圾管理报告》',
    context: '2064 年北陆联邦全国垃圾分类准确率为 78%，与咚达（82%）相近。居民对分类政策的满意度为 91%，但该调查仅覆盖已推行激励制超过五年的地区，新推行地区满意度不足 60%。'
  },
  'day5-article2': {
    quote: '根据国际互联网自由观察组织发布的年度报告',
    source: '国际数字权利观察组织《2064 年全球互联网自由指数报告》',
    context: '本年度报告显示，咚达在互联网治理维度得分较去年提升，在打击网络犯罪、保护未成年人、遏制虚假信息传播等方面成效显著。报告同时指出，咚达在平台透明度方面仍有改进空间。'
  },
  'day5-article3': {
    quote: '根据咚达社会福利研究会的报告，咚达养老护理员的平均月薪仅为3800信用点，是辉光联邦同行的四分之一。',
    source: '咚达社会福利研究会《2064 年养老服务人才发展报告》',
    context: '咚达养老护理员平均月薪 3800 信用点，约为辉光联邦同行的 25%。但辉光联邦护理员薪酬中包含大量政府专项补贴和长期护理保险支付，扣除物价因素后，咚达护理员实际购买力与辉光联邦差距不足 10%。'
  },
  'day5-article3-2': {
    quote: '更低薪酬意味着更低门槛：咚达养老护理员中，接受过专业培训的仅占31%，而辉光联邦这一比例是89%。',
    source: '咚达社会福利研究会《2064 年养老服务人才发展报告》',
    context: '咚达养老护理员接受过系统专业培训的比例为 31%，远低于辉光联邦的 89%。但咚达近年来开展"银龄助老"专项培训，参训人员达 12 万人次，且辉光联邦统计口径包含高校护理专业学历，而咚达以在职培训为主，二者定义存在差异。'
  },
  'day5-article4': {
    quote: '根据国际法治指数报告，咚达在“司法独立”维度的得分仅2.4分（满分10分），而星联国得分为8.7分。报告特别指出，咚达的行政诉讼案件中，政府胜诉率高达97.3%，而在星联国，这一数字为54.6%。',
    source: '国际法治研究院《2064 年全球法治指数报告》',
    context: '在"司法独立"维度，咚达得分 2.4 分，星联国 8.7 分。但需注意，咚达行政诉讼案件中政府胜诉率高达 97.3%，主要原因是咚达将大量行政调解、行政复议等前置程序纳入统计，实际进入诉讼的案件多为争议较小或原告明显不合理的案件。若剔除简易程序，星联国政府胜诉率亦接近 70%。'
  },
  'day5-article5': {
    quote: '据统计，过去三年咚达餐饮服务业减少了37万个基础服务岗位',
    source: '咚达劳动经济研究所《服务业数字化转型与就业结构变化报告》',
    context: '2061-2064 年，咚达餐饮业基础服务岗位（点餐员、收银员等）净减少 37 万个，但同期新增外卖骑手、智慧餐厅运维、数字化营销等岗位 41 万个，整体就业呈增长态势。'
  },
  'day5-article5-2': {
    quote: '樱都国消费者权益组织发布的一份报告指出，过度自动化正在侵蚀服务业的核心价值——“人际连接”。报告显示，樱都国有超过六成消费者表示，选择餐厅时会优先考虑“有人服务”而非“效率高”。',
    source: '樱都国消费者联盟《2064 年服务业消费偏好调查》',
    context: '调查显示，63%的消费者在同等价位下更倾向选择"有人服务"餐厅。但相同比例（61%）的消费者认为自动化设备（如自助点餐机）能显著缩短等待时间，并愿意为此接受较低程度的"人际连接"。'
  },
  
  // Day 6
  'day6-article7': {
    quote: '咚达“星网”平台上线三年来，累计开放数据集超5000个，惠及1200余家机构。',
    source: '咚达数据管理局《星网平台三周年运营报告》',
    context: '截至 2064 年 3 月，星网平台累计开放数据集 5167 个，覆盖气象、交通、经济、地理等 12 个领域，已服务 1200 余家科研机构和企业，支撑便民应用开发 430 余项。'
  },
  'day6-article7-2': {
    quote: '基于开放数据开发的便民应用从第一年的80个增至目前的430个',
    source: '咚达数据管理局《星网平台三周年运营报告》',
    context: '平台开放第一年，第三方基于开放数据开发的应用为 80 个；至第三年，累计应用数量达 430 个，年增长超过 100%。'
  },
  'day6-article7-3': {
    quote: '国际数据治理协会的评估报告显示，咚达的数据开放成熟度在全球排名第5，仅次于辉光和北陆。',
    source: '国际数据治理协会《全球数据开放成熟度指数报告（2064）》',
    context: '咚达在数据开放政策、平台建设、数据质量三个维度得分均进入全球前十，综合排名第五，仅次于辉光联邦、北陆联邦、樱都国和星联国。'
  },
  'day6-article7-4': {
    quote: '在释放数据价值的同时，将隐私泄露风险控制在0.03%以下。',
    source: '咚达数据管理局《星网平台隐私保护白皮书》',
    context: '平台通过脱敏处理、分级授权、访问审计等措施，三年间涉及个人隐私的泄露事件发生率为 0.03%，远低于行业平均水平。'
  },
  'day6-article4': {
    quote: '民间研究机构发布的报告显示，在咚达排名前50的高新技术企业中，星裔高管占比从十年前的7%飙升至34%，而咚达本土人才的晋升率同期下降了22%。',
    source: '咚达人才发展研究会《高新技术企业人才流动趋势报告》',
    context: '咚达排名前 50 的高新技术企业中，外籍（星裔）高管占比从十年前的 7%升至 34%。同期本土人才晋升率下降 22%，但主要原因是企业规模扩张导致管理岗位数量增速低于员工总数增速，而非外籍挤占；此外，本土人才外派至海外研发中心的比例同期上升了 47%。'
  },
  'day6-article5': {
    quote: '数据显示，咚达主流群体对“少数民族优惠政策”的支持率从十年前的67%降至31%，而南屿族人均收入与咚达平均水平的差距在过去十年仅缩小了5%。',
    source: '咚达民族事务研究中心《民族政策社会认知与实效评估报告》',
    context: '主流群体对少数民族优惠政策的支持率由十年前的 67%降至 31%，但同期各民族通婚率上升 42%，跨民族居住区比例增加 28%，反映社会融合度提升；南屿族人均收入与咚达平均水平差距缩小 5%，是在政策投入总量缩减背景下实现的，若考虑物价因素，实际差距缩小 11%。'
  },
  
  // Day 7
  'day7-article3': {
    quote: '《城市公共空间体检报告》中，有一组数据从未被媒体提及：被抽查的120条主次干道中，无障碍设施完好率仅61%，其中盲道被占用、中断、破损的比例高达47%。报告同时指出，这些路段在“城市形象满意度”调查中得分却高达89%。',
    source: '咚达城市规划设计研究院《2064 年度城市公共空间体检报告》',
    context: '本次抽查的 120 条主次干道中，无障碍设施完好率为 61%，盲道占用、中断、破损比例 47%。但报告同时指出，近三年新建道路无障碍设施完好率达 92%，老旧道路改造计划已完成 70%，预计两年内整体完好率可提升至 85%以上。在"城市形象满意度"调查中，得分高达 89%，受访者普遍对城市整体面貌、绿化、卫生等方面给予高分。'
  },
  
  // Day 8
  'day8-article4': {
    quote: '国际遗产保护联盟同期发布的一份监测报告却给出了不同视角。报告指出，灵墟山核心区的游客承载量已超设计上限三倍，古建筑表面出现明显风化，部分石刻因人为触摸受损。报告特别提及：“与樱都国‘月见山’遗产地采用的预约限流、原住民共管模式相比，咚达的‘保护性开发’更偏向商业优先。”',
    source: '国际遗产保护联盟《世界遗产地监测报告（灵墟山卷）》',
    context: '灵墟山核心区游客量超过设计容量三倍，导致古建筑风化加速、石刻受损。但报告同时指出，咚达已启动"数字灵墟"工程，通过 VR 游览分流游客，并计划投资 1.2 亿信用点修缮受损文物。与樱都国"月见山"模式相比，咚达在商业开发强度上更高，但月见山近年面临原住民老龄化、年轻人外流问题，保护活力同样面临挑战。'
  },
  'day8-article6': {
    quote: '在“学术声誉”指标上，咚达高校的平均得分是62.3，辉光同类高校是91.7。在“师均科研产出”上，咚达高校是辉光的1.4倍。在“国际合作论文比例”上，咚达高校从十年前的28%下降到19%，而辉光同期从43%上升到51%。',
    source: '世界大学学术排名中心《2064 年大学排名分析报告》',
    context: '咚达高校在"学术声誉"指标平均得分 62.3，辉光高校 91.7；"师均科研产出"咚达为辉光的 1.4 倍；"国际合作论文比例"咚达十年间从 28%降至 19%，辉光从 43%升至 51%。但报告同时指出，咚达高校的"高被引论文"数量十年增长 340%，"学科交叉研究"排名跃升全球第二；国际合作比例下降的主要原因是咚达本土科研能力增强，内循环比例上升。'
  }
};

// 谬误解释映射
const fallacyExplanations = {
  '以偏概全': '用个别案例概括整体情况',
  '滑坡谬误': '不合理地认为小事件会引发严重后果',
  '诉诸恐惧': '利用恐惧情绪代替理性论证',
  '诉诸权威': '以权威人物的观点作为论证依据',
  '虚假因果': '错误地认为两个事件之间存在因果关系',
  '虚假数据': '使用不实或误导性的数据',
  '阴谋论': '毫无根据的猜测和怀疑',
  '过度夸大': '过分夸大事实或后果',
  '人身攻击': '攻击个人而非论点',
  '预设前提': '在论证中预先假设结论为真',
  '前提与结论无关': '论据与结论之间没有逻辑联系',
  '推理太跳跃': '论证过程缺少必要的逻辑步骤',
  '轶事证据': '用个人经历或个案作为普遍结论的依据',
  '诉诸情感': '利用情感代替理性论证',
  '简单归因': '将复杂问题简单归结为单一原因',
  '虚假两难': '将问题简化为非此即彼的选择',
  '忽略背景': '忽略相关背景信息进行判断',
  '稻草人谬误': '歪曲对手论点后再攻击',
  '偷换概念': '混淆概念含义进行论证',
  '虚假对比': '不当比较不相关事物',
  '虚假归因': '错误地将结果归因于某因素',
  '轻率归纳': '基于不足的证据得出结论',
  '数据对比': '通过数据对比得出误导性结论',
  '虚假平衡': '在有明确证据支持一方时仍保持中立',
  '诉诸自然': '认为自然的就是好的',
  '诉诸历史': '用历史事件支持当前观点',
  '虚假权威': '引用不相关或不可靠的权威',
  '错误类比': '将不同性质的事物进行不当类比',
};

// 监听游戏状态变化
watch(() => gameStore.selectedFlaws, (newFlaws) => {
  selectedFlaws.value = newFlaws;
}, { deep: true });

// 根据逻辑诊断选项动态调整话术预警
const limitedFallacies = computed(() => {
  // 返回逻辑诊断选项的前三个及其解释
  return logicFallacies.value.map(fallacy => [
    fallacy,
    fallacyExplanations[fallacy as keyof typeof fallacyExplanations] || '未知谬误'
  ]);
});

// 高亮文章内容
const highlightedContent = computed(() => {
  if (!gameStore.currentArticle) return '';
  
  let content = gameStore.currentArticle.content;
  const day = gameStore.currentDay;
  const articleId = gameStore.currentArticle.id;
  
  // 高亮引用资料 - 遍历所有可能的引用资料
  Object.entries(referenceDataMap).forEach(([key, reference]) => {
    // 检查是否匹配当前天数和文章ID
    if (key.startsWith(`day${day}-article${articleId}`)) {
      const quote = reference.quote;
      
      // 直接进行字符串替换，不使用正则表达式
      if (content.includes(quote)) {
        content = content.replace(quote, 
          `<span class="reference-quote" data-reference-key="${key}">${quote}</span>`
        );
      }
    }
  });
  
  // 高亮事实
  gameStore.currentArticle.facts.forEach(fact => {
    const factText = fact.text;
    if (content.includes(factText)) {
      content = content.replace(factText, 
        `<span class="highlighted-fact">${factText}</span>`
      );
    }
  });
  
  return content;
});

// 是否可以裁决
const canRule = computed(() => {
  return gameStore.selectedFlaws.length > 0;
});

// 动态生成逻辑诊断选项（包含干扰项）
const logicFallacies = computed(() => {
  if (!gameStore.currentArticle) return [];
  
  // 获取文章的fallacies
  const articleFallacies = gameStore.currentArticle.fallacies;
  
  // 干扰项列表
  const distractorFallacies = ['预设前提', '前提与结论无关', '推理太跳跃', '轶事证据', '诉诸情感', '简单归因', '虚假两难', '滑坡谬误', '人身攻击', '诉诸权威'];
  
  // 如果文章有fallacies
  if (articleFallacies.length > 0) {
    // 随机选择文章的2个fallacies作为正确选项
    const shuffledFallacies = [...articleFallacies].sort(() => Math.random() - 0.5);
    const correctFallacies = shuffledFallacies.slice(0, 2);
    
    // 过滤出不与文章fallacies相同的干扰项
    const availableDistractors = distractorFallacies.filter(d => !articleFallacies.includes(d));
    
    // 如果有可用的干扰项，随机选择一个
    if (availableDistractors.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableDistractors.length);
      const distractor = availableDistractors[randomIndex];
      
      // 将干扰项插入到随机位置
      const result = [...correctFallacies, distractor];
      
      // 随机打乱顺序
      return result.sort(() => Math.random() - 0.5);
    }
    
    // 如果没有可用的干扰项，只返回文章的fallacies
    return articleFallacies.slice(0, 3);
  }
  
  // 如果没有fallacies，使用默认选项
  return ['预设前提', '前提与结论无关', '推理太跳跃'];
});

// 结算统计
const correctReports = computed(() => {
  return gameStore.todayRecords.filter(record => record.userAction === 'report' && record.isCorrect).length;
});

const incorrectPasses = computed(() => {
  return gameStore.todayRecords.filter(record => record.userAction === 'pass' && !record.isCorrect).length;
});

const correctRevises = computed(() => {
  return gameStore.todayRecords.filter(record => record.userAction === 'revise' && record.isCorrect).length;
});

const correctPasses = computed(() => {
  return gameStore.todayRecords.filter(record => {
    const article = gameStore.articles.find(a => a.id === record.articleId);
    return record.userAction === 'pass' && record.isCorrect && article && article.expectedAction === 'pass';
  }).length;
});

const incorrectRevises = computed(() => {
  return gameStore.todayRecords.filter(record => {
    const article = gameStore.articles.find(a => a.id === record.articleId);
    return record.userAction === 'revise' && !record.isCorrect && article && article.expectedAction === 'pass';
  }).length;
});

const incorrectReports = computed(() => {
  return gameStore.todayRecords.filter(record => {
    const article = gameStore.articles.find(a => a.id === record.articleId);
    return record.userAction === 'report' && !record.isCorrect && article && article.expectedAction === 'pass';
  }).length;
});

const bonusScore = computed(() => {
  let bonus = 0;
  gameStore.todayRecords.forEach(record => {
    const article = gameStore.articles.find(a => a.id === record.articleId);
    if (!article) return;
    
    // 检验论据评分
    // 判断文章是否存在论据错误
    const hasEvidenceErrors = article.facts.some(f => 
      f.sourceStatus === 'missing' || f.sourceStatus === 'unreliable' || f.sourceStatus === 'misquoted' || f.sourceStatus === 'incomplete'
    );
    
    if (hasEvidenceErrors) {
      // 文章存在论据错误，检查玩家是否勾选了正确的论据错误
      const correctEvidenceFlaws = record.selectedFlaws.filter(flaw => {
        const evidenceOptions = ['缺乏信息来源', '信息来源不可靠', '断章取义'];
        return evidenceOptions.includes(flaw) && isCorrectFlaw(flaw, record.articleId);
      });
      
      if (correctEvidenceFlaws.length > 0) {
        bonus += 5;
      }
    } else {
      // 文章没有论据错误，检查玩家是否选择了"一切正常"
      if (record.selectedFlaws.includes('一切正常')) {
        bonus += 5;
      }
    }
    
    // 逻辑诊断评分
    // 判断文章是否存在逻辑谬误
    const hasLogicalFallacies = article.fallacies.length > 0;
    
    if (hasLogicalFallacies) {
      // 文章存在逻辑谬误，统计玩家勾选的正确逻辑错误数量
      const correctLogicalFlaws = record.selectedFlaws.filter(flaw => {
        const logicOptions = ['没有问题'];
        if (logicOptions.includes(flaw)) return false;
        return isCorrectFlaw(flaw, record.articleId);
      });
      
      bonus += correctLogicalFlaws.length * 5;
    } else {
      // 文章没有逻辑谬误，检查玩家是否选择了"没有问题"
      if (record.selectedFlaws.includes('没有问题')) {
        bonus += 5;
      }
    }
  });
  return bonus;
});



// 检查是否是正确的违规点
const isCorrectFlaw = (flaw: string, articleId: number): boolean => {
  const article = gameStore.articles.find(a => a.id === articleId);
  if (!article) return false;
  
  switch (flaw) {
    case '缺乏信息来源':
      return article.facts.some(f => f.sourceStatus === 'missing');
    case '信息来源不可靠':
      return article.facts.some(f => f.sourceStatus === 'unreliable');
    case '断章取义':
      return article.facts.some(f => f.sourceStatus === 'misquoted');
    default:
      // 如果是逻辑诊断选项，检查是否是文章的fallacies之一
      return article.fallacies.includes(flaw);
  }
};

// 转义正则表达式
// 裁决处理
const rule = (action: 'pass' | 'revise' | 'report') => {
  if (!isInteractive.value) return;
  
  // 关闭引用资料弹窗但不播放音效
  showReferencePopup.value = false;
  
  if (action === 'pass') {
    // 播放通过按钮音效
    playSound('pass');
    
    // 通过按钮动画 - 当前文章左滑退出
    animationState.value = 'pass-exit';
    
    // 延迟一段时间后加载下一篇文章并切换容器，让玩家能看到退出效果
    setTimeout(() => {
      gameStore.recordRuling(action);
      gameStore.loadNextArticle();
      currentContainerIndex.value = currentContainerIndex.value === 0 ? 1 : 0;
      
      // 立即开始进入动画
      animationState.value = 'pass-enter';
      
      setTimeout(() => {
        animationState.value = 'normal';
      }, 400);
    }, 200);
  } else if (action === 'revise') {
    // 播放退回按钮音效
    playSound('reject');
    
    // 退回按钮动画 - 当前文章上滑退出
    animationState.value = 'revise-exit';
    
    // 延迟更长时间后加载下一篇文章并切换容器，让玩家能更清楚看到退出效果
    setTimeout(() => {
      gameStore.recordRuling(action);
      gameStore.loadNextArticle();
      currentContainerIndex.value = currentContainerIndex.value === 0 ? 1 : 0;
      
      // 立即开始进入动画
      animationState.value = 'revise-enter';
      
      setTimeout(() => {
        animationState.value = 'normal';
      }, 500);
    }, 300);
  } else if (action === 'report') {
    // 播放枪毙按钮音效
    playSound('reload');
    
    // 枪毙按钮 - 进入射击模式
    animationState.value = 'shooting-mode';
    reportButtonText.value = '结束';
  }
};

// 结束射击模式
const endShootingMode = () => {
  if (!isInteractive.value) return;
  
  // 播放结束按钮音效
  playSound('gunReturn');
  
  // 结束按钮时，文章下滑退出
  animationState.value = 'report-exit';
  reportButtonText.value = '枪毙';
  
  // 延迟更长时间后加载下一篇文章并切换容器，让玩家能更清楚看到退出效果
  setTimeout(() => {
    gameStore.recordRuling('report');
    gameStore.loadNextArticle();
    currentContainerIndex.value = currentContainerIndex.value === 0 ? 1 : 0;
    
    // 清除弹孔
    bulletHoles.value = [];
    
    // 立即开始进入动画
    animationState.value = 'report-enter';
    
    // 延迟恢复正常状态
    setTimeout(() => {
      animationState.value = 'normal';
    }, 500);
  }, 300);
};

// 添加弹孔
const addBulletHole = (event: MouseEvent) => {
  if (animationState.value !== 'shooting-mode') return;
  
  // 播放射击音效
  playSound('shot');
  
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  bulletHoles.value.push({ x, y });
  
  // 射击时触发震动效果
  const gameLayout = document.querySelector('.game-layout');
  if (gameLayout) {
    gameLayout.classList.add('shaking');
    setTimeout(() => {
      gameLayout.classList.remove('shaking');
    }, 200);
  }
};

// 工作区操作
const openWorkspace = () => {
  if (!isInteractive.value) return;
  // 播放检验清单点击音效
  playSound('listClick');
  showWorkspace.value = true;
};

const closeWorkspace = () => {
  if (!isInteractive.value) return;
  // 播放检验清单关闭音效
  playSound('listClose');
  showWorkspace.value = false;
};

const updateFlaws = () => {
  // 播放选项勾选音效
  playSound('optionClick');
  gameStore.selectedFlaws = selectedFlaws.value;
  
  // 处理互斥逻辑
  if (selectedFlaws.value.includes('一切正常')) {
    const otherArgs = ['缺乏信息来源', '信息来源不可靠', '断章取义'];
    otherArgs.forEach(arg => {
      const index = selectedFlaws.value.indexOf(arg);
      if (index > -1) selectedFlaws.value.splice(index, 1);
    });
  }
  
  if (selectedFlaws.value.includes('没有问题')) {
    // 使用动态生成的逻辑诊断选项
    logicFallacies.value.forEach(logic => {
      const index = selectedFlaws.value.indexOf(logic);
      if (index > -1) selectedFlaws.value.splice(index, 1);
    });
  }
  
  gameStore.selectedFlaws = selectedFlaws.value;
};

// 引用资料弹窗操作
const showReference = (key: string) => {
  const reference = referenceDataMap[key as keyof typeof referenceDataMap];
  if (reference) {
    referenceData.value = {
      source: reference.source,
      context: reference.context
    };
    showReferencePopup.value = true;
    // 播放引用资料窗口出现音效
    playSound('refwindow');
  }
};

const closeReferencePopup = () => {
  showReferencePopup.value = false;
  // 播放引用资料窗口关闭音效
  playSound('refwindowClose');
};

const startDrag = (event: MouseEvent) => {
  isDragging.value = true;
  dragOffset.value = {
    x: event.clientX - popupPosition.value.x,
    y: event.clientY - popupPosition.value.y
  };
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDrag);
};

const drag = (event: MouseEvent) => {
  if (isDragging.value) {
    // 限制弹窗不能拖到顶部栏
    const topBarHeight = 60; // 假设顶部栏高度为60px
    let newY = event.clientY - dragOffset.value.y;
    if (newY< topBarHeight) {
      newY = topBarHeight;
    }
    popupPosition.value = {
      x: event.clientX - dragOffset.value.x,
      y: newY
    };
  }
};

const stopDrag = () =>{
  isDragging.value = false;
  document.removeEventListener('mousemove', drag);
  document.removeEventListener('mouseup', stopDrag);
};

// 设置操作
const toggleSettings = () => {
  if (!isInteractive.value) return;
  // 根据当前状态播放不同音效
  if (showSettings.value) {
    // 关闭设置页面
    playSound('settingClose');
  } else {
    // 打开设置页面
    playSound('settingClick');
  }
  showSettings.value = !showSettings.value;
};

// 设置相关
const showSaveSlots = ref(false);

// 关闭存档槽位选择页面
const closeSaveSlots = () => {
  if (!isInteractive.value) return;
  // 播放关闭音效（与设置页面关闭音效一致）
  playSound('settingClose');
  showSaveSlots.value = false;
};

// 保存并退出
const saveAndQuit = () => {
  if (!isInteractive.value) return;
  // 播放保存并退出按钮音效
  playSound('saveAndQuit');
  showSaveSlots.value = true;
};

// 确认保存到指定槽位
const confirmSave = (slot: number) => {
  if (!isInteractive.value) return;
  
  // 播放存档音效
  playSound('save');
  
  const existingSave = gameStore.getSaves().find(s => s.slot === slot);
  if (existingSave) {
    // 如果存档槽位已存在，显示确认对话框
    if (confirm('确定要覆盖存档吗？')) {
      gameStore.saveProgress(slot);
      showSaveSlots.value = false;
      window.dispatchEvent(new CustomEvent('game-quit'));
    }
  } else {
    // 如果存档槽位为空，直接保存
    gameStore.saveProgress(slot);
    showSaveSlots.value = false;
    window.dispatchEvent(new CustomEvent('game-quit'));
  }
};

// 格式化存档时间
const formatSlotTime = (timestamp?: number) => {
if (!timestamp) return '';
const date = new Date(timestamp);
return date.toLocaleString('zh-CN', {
year: 'numeric',
month: '2-digit',
day: '2-digit',
hour: '2-digit',
minute: '2-digit'
});
};

// 结算操作
const nextDay = async () => {
  if (!isInteractive.value) return;
  isLoading.value = true;
  
  try {
    // 计算当天的实际收入（与显示的收入一致）
    const dailyIncome = correctReports.value * 60 - incorrectPasses.value * 40 - (incorrectRevises.value + incorrectReports.value) * 40 + correctPasses.value * 50 + correctRevises.value * 40 + bonusScore.value;
    
    await gameStore.nextDay(dailyIncome);
    
    // 如果没有特殊事件，直接播放下一天的背景音乐
    if (!gameStore.showSpecialEvent) {
      playBackgroundMusic();
    }
  } finally {
    isLoading.value = false;
  }
};

const openDetailModal = () => {
  showDetailModal.value = true;
  // 延迟一下确保DOM已更新，然后滚动到顶部
  setTimeout(() => {
    if (detailContentRef.value) {
      detailContentRef.value.scrollTop = 0;
    }
  }, 100);
};

const closeDetailModal = () => {
  showDetailModal.value = false;
};

const getActionText = (action: string) => {
  switch (action) {
    case 'pass':
      return '通过';
    case 'revise':
      return '退回修改';
    case 'report':
      return '枪毙';
    default:
      return action;
  }
};

const getExpectedAction = (record: any) => {
  const article = gameStore.articles.find(a => a.id === record.articleId);
  return article ? article.expectedAction : 'pass';
};

const getExpectedActionText = (record: any) => {
  const expectedAction = getExpectedAction(record);
  switch (expectedAction) {
    case 'pass':
      return '正确';
    case 'revise':
      return '退回';
    case 'report':
      return '枪毙';
    default:
      return '未知';
  }
};

const getReviewReason = (record: any) => {
  const article = gameStore.articles.find(a => a.id === record.articleId);
  if (!article) return '无法获取文章信息';
  
  const expectedAction = article.expectedAction;
  
  if (expectedAction === 'pass') {
    return '文章内容符合要求，没有发现错误信息。';
  } else {
    let reason = '';
    
    // 收集检验论据的错误
    const problematicFacts = article.facts.filter(fact => 
      fact.sourceStatus !== 'normal' && fact.sourceStatus !== 'truth'
    );
    
    if (problematicFacts.length > 0) {
      reason += '检验论据错误：';
      problematicFacts.forEach((fact, index) => {
        if (index > 0) reason += '；';
        reason += `"${fact.text}"`;
        
        switch (fact.sourceStatus) {
          case 'missing':
            reason += '（缺乏信息来源）';
            break;
          case 'unreliable':
            reason += '（信息来源不可靠）';
            break;
          case 'misquoted':
            reason += '（断章取义）';
            break;
          case 'incomplete':
            reason += '（信息来源不完整）';
            break;
        }
      });
    }
    
    // 收集逻辑诊断的错误
    if (article.fallacies.length > 0) {
      if (reason) reason += '\n';
      reason += '逻辑诊断错误：';
      reason += article.fallacies.join('、');
    }
    
    return reason || '文章内容存在问题，需要相应处理。';
  }
};

const quitGame = () => {
  if (!isInteractive.value) return;
  window.dispatchEvent(new CustomEvent('game-quit'));
};

// 音效管理 - 预加载音效
const sounds = {
  // 欢迎语
  welcome: new Audio('/assets/audio/sound-effects/game-page/welcome/welcome.mp3'),
  
  // 裁决区音效
  pass: new Audio('/assets/audio/sound-effects/game-page/ruling-panel/pass.mp3'),
  reject: new Audio('/assets/audio/sound-effects/game-page/ruling-panel/reject.mp3'),
  reload: new Audio('/assets/audio/sound-effects/game-page/ruling-panel/reload.mp3'),
  shot: new Audio('/assets/audio/sound-effects/game-page/ruling-panel/shot.mp3'),
  gunReturn: new Audio('/assets/audio/sound-effects/game-page/ruling-panel/gun-return.mp3'),
  
  // 内容区音效
  refwindow: new Audio('/assets/audio/sound-effects/game-page/article-panel/refwindow.mp3'),
  refwindowClose: new Audio('/assets/audio/sound-effects/game-page/article-panel/refwindow-close.mp3'),
  
  // 工作区音效
  listClick: new Audio('/assets/audio/sound-effects/game-page/workspace-panel/list-click.mp3'),
  listClose: new Audio('/assets/audio/sound-effects/game-page/workspace-panel/list-close.mp3'),
  optionClick: new Audio('/assets/audio/sound-effects/game-page/workspace-panel/option-click.mp3'),
  
  // 设置页面音效
  settingClick: new Audio('/assets/audio/sound-effects/game-page/setting/setting-click.mp3'),
  saveAndQuit: new Audio('/assets/audio/sound-effects/game-page/setting/save-and-quit.mp3'),
  settingClose: new Audio('/assets/audio/sound-effects/game-page/setting/setting-close.mp3'),
  save: new Audio('/assets/audio/sound-effects/game-page/setting/save.mp3'),
  
  // 特殊事件音效
  eventOpen: new Audio('/assets/audio/sound-effects/game-page/special-event/event-open.mp3'),
  eventClose: new Audio('/assets/audio/sound-effects/game-page/special-event/event-close.mp3')
};

// 背景音乐
const backgroundMusic = {
  horizon: new Audio('/assets/audio/background/horizon.mp3'),
  crepuscule: new Audio('/assets/audio/background/crepuscule.mp3'),
  intrapersonal: new Audio('/assets/audio/background/intrapersonal-communication.mp3'),
  endOfDay: new Audio('/assets/audio/background/end-of-day.mp3')
};

// 设置背景音乐音量
Object.values(backgroundMusic).forEach(audio => {
  audio.volume = 0.3;
  audio.loop = true;
});

// 取消今日结算音乐的循环播放
backgroundMusic.endOfDay.loop = false;

// 设置音量
const updateSoundVolume = () => {
  Object.values(sounds).forEach(audio => {
    audio.volume = soundVolume.value / 100;
  });
};

const updateMusicVolume = () => {
  Object.values(backgroundMusic).forEach(audio => {
    audio.volume = musicVolume.value / 100;
  });
};

// 初始设置音量
updateSoundVolume();
updateMusicVolume();

// 预加载音效
const preloadSounds = () => {
  Object.values(sounds).forEach(audio => {
    audio.load();
  });
  
  // 预加载背景音乐
  Object.values(backgroundMusic).forEach(audio => {
    audio.load();
  });
};

// 播放音效
const playSound = (type: keyof typeof sounds) => {
  const audio = sounds[type];
  audio.currentTime = 0;
  audio.play().catch(e => console.log('音效播放失败:', e));
};

// 根据当前天数选择背景音乐
const getBackgroundMusicForDay = (day: number) => {
  switch (day) {
    case 1:
    case 4:
    case 8:
    case 9:
      return backgroundMusic.horizon;
    case 2:
    case 5:
      return backgroundMusic.crepuscule;
    case 3:
    case 6:
    case 7:
      return backgroundMusic.intrapersonal;
    default:
      return backgroundMusic.horizon;
  }
};

// 当前播放的背景音乐
let currentBackgroundMusic: HTMLAudioElement | null = null;

// 播放背景音乐
const playBackgroundMusic = () => {
  // 停止当前播放的音乐
  if (currentBackgroundMusic) {
    currentBackgroundMusic.pause();
    currentBackgroundMusic.currentTime = 0;
  }
  
  // 根据当前天数选择并播放音乐
  const music = getBackgroundMusicForDay(gameStore.currentDay);
  currentBackgroundMusic = music;
  music.currentTime = 0;
  music.play().catch(e => console.log('背景音乐播放失败:', e));
};

// 标记开场动画是否已完成
let openingCompleted = false;

// 定义开场动画完成处理函数
const handleOpeningCompleted = () => {
  // 防止重复执行
  if (openingCompleted) return;
  
  openingCompleted = true;
  
  // 开场动画完成后显示欢迎文字
  setTimeout(() => {
    showWelcome.value = true;
    // 播放欢迎语音效
    playSound('welcome');
    
    // 延迟后让欢迎文字渐隐（停留4秒）
    setTimeout(() => {
      fadeOutWelcome.value = true;
      
      // 等待渐隐动画完成后再显示游戏面板（动画时长0.8秒）
      setTimeout(() => {
        showGamePanel.value = true;
        // 游戏面板显示后才允许交互
        isInteractive.value = true;
        
        // 欢迎语完全消失后播放背景音乐
        playBackgroundMusic();
      }, 800);
    }, 4000);
  }, 500);
};

// 监听引用资料点击事件（使用事件委托）
const handleReferenceClick = (event: Event) => {
  const target = event.target as HTMLElement;
  const quoteElement = target.closest('.reference-quote');
  if (quoteElement) {
    const key = quoteElement.getAttribute('data-reference-key');
    if (key) {
      showReference(key);
    }
  }
};

// 特殊事件音效处理
const handleSpecialEventOpened = () => {
  playSound('eventOpen');
};

const handleSpecialEventClosed = () => {
  playSound('eventClose');
};

// 组件挂载时触发渐显效果
onMounted(() => {
  isVisible.value = true;
  
  // 预加载音效
  preloadSounds();
  
  // 添加事件监听
  window.addEventListener('opening-completed', handleOpeningCompleted);
  window.addEventListener('special-event-opened', handleSpecialEventOpened);
  window.addEventListener('special-event-closed', handleSpecialEventClosed);
  
  // 监听游戏开始事件（用于读取存档时显示欢迎语）
  window.addEventListener('game-start', () => {
    // 如果是读取存档，显示欢迎语并在欢迎语退出后播放背景音乐
    handleOpeningCompleted();
  });
  
  // 检查是否已经错过事件（用户快速跳过的情况）
  // 通过检查开场动画组件是否还存在来判断
  setTimeout(() => {
    const openingScene = document.querySelector('.opening-scene');
    if (!openingScene) {
      // 开场动画已经结束但事件可能没触发，手动调用处理函数
      handleOpeningCompleted();
    }
  }, 100);
  
  // 监听特殊事件完成事件
  window.addEventListener('special-event-completed', () => {
    gameStore.closeSpecialEvent();
  });
  
  // 使用事件委托，在document上监听点击事件（兼容全屏模式）
  setTimeout(() => {
    document.addEventListener('click', handleReferenceClick);
  }, 500);
  
  // 监听特殊事件状态变化，确保事件能正确显示
  watch(() => gameStore.showSpecialEvent, (newVal) => {
    if (newVal && gameStore.specialEventData) {
      console.log('显示特殊事件:', gameStore.specialEventData.title);
    }
  });
  
  watch(() => gameStore.specialEventData, (newVal) => {
    if (newVal && gameStore.showSpecialEvent) {
      console.log('特殊事件数据:', newVal);
    }
  });
  
  // 监听结算页面显示
  watch(() => gameStore.isGameCompleted, (isCompleted) => {
    if (isCompleted && !gameStore.isGameEnd) {
      // 停止当前播放的背景音乐
      if (currentBackgroundMusic) {
        currentBackgroundMusic.pause();
        currentBackgroundMusic.currentTime = 0;
        currentBackgroundMusic = null;
      }
      
      // 播放今日结算音乐（只播放一次）
      backgroundMusic.endOfDay.currentTime = 0;
      backgroundMusic.endOfDay.play().catch(e => console.log('今日结算音乐播放失败:', e));
    }
  });
  
  // 监听特殊事件关闭，播放下一天背景音乐
window.addEventListener('special-event-closed', () => {
  // 特殊事件关闭后播放下一天的背景音乐
  playBackgroundMusic();
});

// 监听音量变化
watch(soundVolume, () => {
  updateSoundVolume();
});

watch(musicVolume, () => {
  updateMusicVolume();
});
});

// 组件卸载时移除事件监听器
onUnmounted(() => {
  window.removeEventListener('opening-completed', handleOpeningCompleted);
  window.removeEventListener('special-event-opened', handleSpecialEventOpened);
  window.removeEventListener('special-event-closed', handleSpecialEventClosed);
  window.removeEventListener('game-start', () => {});
  
  // 移除引用资料点击事件监听
  document.removeEventListener('click', handleReferenceClick);
  
  // 停止背景音乐
  if (currentBackgroundMusic) {
    currentBackgroundMusic.pause();
    currentBackgroundMusic.currentTime = 0;
  }
});</script><style scoped>.game-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  opacity: 0;
  transition: opacity 1s ease;
}

.game-page.fade-in {
  opacity: 1;
}

.welcome-message {
  font-size: 32px;
  font-weight: bold;
  color: #ededed;
  text-align: center;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) translateY(50px);
  opacity: 0;
  transition: all 0.8s ease;
  text-shadow: 0 0 20px rgba(211, 204, 202, 0.43);
  z-index: 1000;
}

.welcome-message.show {
  transform: translate(-50%, -50%) translateY(0);
  opacity: 1;
}

.welcome-message.fade-out {
  opacity: 0;
  transform: translate(-50%, -50%) translateY(-20px);
  transition: all 0.8s ease;
  pointer-events: none;
}

.top-status {
  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.8s ease;
  transition-delay: 0.2s;
}

.top-status.show {
  opacity: 1;
  transform: translateY(0);
}

.top-status {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding: 16px;
  border-radius: 0;
  font-size: 20px;
  font-weight: bold;
  color: #ffffff;
  position: relative;
  backdrop-filter: none;
  border-bottom: solid 2px #feffffad;
}

.salary-text {
  flex: 1;
  text-align: left;
  font-size: 17px;
  font-weight: normal;
}

.day-text {
  flex: 2;
  text-align: center;
}

.settings-container {
  flex: 1;
  text-align: right;
}

.settings-button {
  background: rgba(255, 255, 255, 0);
  border: none;
  cursor: pointer;
  color: #ffffff;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.settings-button:hover svg {
  animation: rotate 1s ease-in-out forwards;
}

.settings-button:hover svg path {
  fill: #ffffff;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 设置弹窗关闭按钮位置 */
.modal-overlay.show .close-button {
  top: 120px;
}

.game-layout {
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  gap: 24px;
  height: calc(100vh - 160px);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s ease;
  transition-delay: 0.4s;
}

.game-layout.show {
  opacity: 1;
  transform: translateY(0);
}

/* 裁决区 */
.ruling-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.warning-section {
  flex: 1;
}

.fallacies-list {
  list-style: none;
}

.fallacy-item {
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(10, 170, 222, 0.1);
  border: none;
  border-radius: 0;
  position: relative;
  transition: all 0.3s ease;
  backdrop-filter: none;
}

.fallacy-item:hover {
  background: rgba(10, 170, 222, 0.2);
}

.fallacy-item::before {
  content: '⚠';
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #0aaade;
  font-size: 14px;
}

.fallacy-name {
  color: #ffffff;
  font-weight: bold;
  margin-left: 28px;
  display: block;
}

.fallacy-explanation {
  color: #ffffff;
  font-size: 13px;
  display: block;
  margin-top: 6px;
  margin-left: 28px;
  line-height: 1.4;
}

.button-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 160px;
}

.button-container {
  display: flex;
  flex-direction: row;
  gap: 8px;
}

.button-container .ruling-button {
  flex: 1;
}

.rule-hint {
  color: #ffffff;
  font-size: 13px;
  text-align: center;
  margin-top: 12px;
  padding: 8px;
  background: transparent;
  border-radius: 0;
  backdrop-filter: none;
}

/* 文章展示区 */
.article-display {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* 文章区滚动条样式 - 浏览器兼容性支持 */
.article-display {
  /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: rgba(10, 170, 222, 0.4) rgba(10, 10, 10, 0.3);
}

/* WebKit (Chrome, Safari, Edge) */
.article-display::-webkit-scrollbar {
  width: 4px;
}

.article-display::-webkit-scrollbar-track {
  background: rgba(10, 10, 10, 0.3);
}

.article-display::-webkit-scrollbar-thumb {
  background: rgba(10, 170, 222, 0.4);
  border-radius: 2px;
}

.article-display::-webkit-scrollbar-thumb:hover {
  background: rgba(10, 170, 222, 0.6);
}

/* Edge Legacy */
.article-display::-ms-scrollbar {
  width: 4px;
}

.article-display::-ms-scrollbar-track {
  background: rgba(10, 10, 10, 0.3);
}

.article-display::-ms-scrollbar-thumb {
  background: rgba(10, 170, 222, 0.4);
  border-radius: 2px;
}

.article-display::-ms-scrollbar-thumb:hover {
  background: rgba(10, 170, 222, 0.6);
}

.author-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: transparent;
  border-radius: 0;
  border: none;
  backdrop-filter: none;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid rgba(10, 170, 222, 0.6);
  background: rgba(10, 170, 222, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: bold;
  font-size: 20px;
}

.author-name {
  color: #ffffff;
  font-weight: bold;
  font-size: 16px;
}

.article-title {
  color: #ffffff;
  font-size: 24px;
  font-weight: bold;
  line-height: 1.3;
  padding: 20px;
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
}

.article-content {
  color: #ffffff;
  font-size: 16px;
  line-height: 1.8;
  text-align: justify;
  padding: 20px;
  background: transparent;
  border-radius: 0;
  border: none;
  backdrop-filter: none;
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
}

.highlighted-fact {
  background: rgba(10, 170, 222, 0.1);
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 0;
  transition: all 0.2s ease;
  position: relative;
}

.highlighted-fact:hover {
  background: rgba(10, 170, 222, 0.3);
  transform: translateY(-1px);
}

/* 引用资料高亮 */
:deep(.reference-quote) {
  text-decoration: underline;
  text-decoration-color: #0aaade;
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
  cursor: pointer;
  color: #0aaade !important;
  transition: all 0.2s ease;
}

:deep(.reference-quote:hover) {
  text-decoration-color: #ffffff;
  color: #ffffff !important;
}

/* 引用资料弹窗 */
.reference-popup {
  position: fixed;
  width: 450px;
  background: rgba(10, 10, 10, 0.95);
  border: 1px solid rgba(10, 170, 222, 0.5);
  border-radius: 8px;
  z-index: 1000;
  box-shadow: 0 8px 32px rgba(10, 170, 222, 0.3);
  backdrop-filter: blur(10px);
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(10, 170, 222, 0.3);
  cursor: move;
}

.popup-title {
  font-size: 18px;
  font-weight: bold;
  color: #0aaade;
}

.popup-close {
  background: none;
  border: none;
  color: #ffffff;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.popup-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.popup-content {
  padding: 20px;
  max-height: 350px;
  overflow-y: auto;
}

.source-info {
  margin-bottom: 16px;
  font-size: 16px;
  line-height: 1.6;
  color: #cccccc;
}

.context-info {
  font-size: 15px;
  line-height: 1.7;
  color: #eeeeee;
}

.context-info p {
  margin: 12px 0 0 0;
  white-space: pre-wrap;
}

/* 工作区 */
.workspace-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.notebook-button {
  width: 200px;
  height: 280px;
  background: transparent;
  border: none;
  border-radius: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backdrop-filter: none;
}

.notebook-button::before {
  content: '';
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  bottom: 10px;
  border: 1px solid rgba(10, 170, 222, 0.3);
  border-radius: 8px;
}

.notebook-button::after {
  content: '';
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  height: 1px;
  background: linear-gradient(90deg, rgba(10, 170, 222, 0.8), rgba(10, 170, 222, 0.2));
  box-shadow: 
    0 30px 0 rgba(10, 170, 222, 0.3),
    0 60px 0 rgba(10, 170, 222, 0.2),
    0 90px 0 rgba(10, 170, 222, 0.3),
    0 120px 0 rgba(10, 170, 222, 0.2),
    0 150px 0 rgba(10, 170, 222, 0.3),
    0 180px 0 rgba(10, 170, 222, 0.2);
}

.notebook-button:hover {
  transform: translateY(-5px);
  border-color: #0aaade;
}

.notebook-text {
  color: #ffffff;
  font-size: 18px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* 工作区内容 */
.workspace-content {
  display: flex;
  flex-direction: row;
  gap: 24px;
}

.section {
  flex: 1;
  text-align: center;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: center;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 56px;
  cursor: pointer;
  padding: 12px;
  border-radius: 0;
  transition: all 0.2s ease;
  border: none;
  background: transparent;
  backdrop-filter: none;
}

.checkbox-item:hover {
  background: rgba(10, 170, 222, 0.1);
}

.checkbox-item input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: #0aaade;
  border: 2px solid rgba(10, 170, 222, 0.4);
  border-radius: 4px;
  cursor: pointer;
}

.checkbox-item span {
  color: #ffffff;
  font-weight: 500;
}

/* 结算内容 */
.settlement-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 32px;
}

.settlement-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: transparent;
  border-radius: 0;
  border: none;
  backdrop-filter: none;
}

.total-score {
  padding: 16px;
  background: transparent;
  border-radius: 0;
  text-align: center;
  font-size: 20px;
  margin-top: 8px;
  backdrop-filter: none;
}

.ending-content {
  padding: 32px;
  text-align: center;
  font-size: 18px;
  color: #ffffff;
}

.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
}

/* 设置弹窗样式 */
.settings-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.setting-item label {
  width: 100px;
  color: #ffffff;
  font-weight: 500;
}

.volume-slider {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: #0aaade;
  border-radius: 50%;
  cursor: pointer;
}

.volume-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #0aaade;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.volume-value {
  width: 50px;
  color: #ffffff;
  text-align: right;
}

/* 存档槽位选择弹窗样式 */
.save-slots {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.save-slot {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(26, 143, 189, 0.3);
  border-radius: 0;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.save-slot:hover {
  background: rgba(10, 170, 222, 0.1);
  border-color: #0aaade;
}

.slot-number {
  font-size: 16px;
  font-weight: 500;
  color: #ffffff;
  display: block;
  margin-bottom: 4px;
}

.slot-info {
  font-size: 12px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 8px;
}

.slot-empty {
  font-size: 12px;
  color: #64748b;
}

.auto-save-label {
  font-size: 12px;
  font-weight: 400;
  color: #0aaade;
  background: rgba(10, 170, 222, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid rgba(10, 170, 222, 0.3);
  margin-left: 8px;
}

.custom-save-label {
  font-size: 12px;
  font-weight: 400;
  color: #4ade80;
  background: rgba(74, 222, 128, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid rgba(74, 222, 128, 0.3);
  margin-left: 8px;
}

/* 动画样式 */
.article-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  background: rgba(10, 170, 222, 0.05);
  border: 1px solid rgba(10, 170, 222, 0.2);
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(10, 170, 222, 0.3);
  border-top: 4px solid #0aaade;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.loading-text {
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.article-display {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: all 0.4s ease;
  overflow-y: auto;
  opacity: 0;
  pointer-events: none;
}

.article-display.active {
  opacity: 1;
  pointer-events: auto;
}

/* 通过按钮动画 - 当前文章从左侧退出 */
.article-display.pass-exit.active {
  transform: translateX(-100%);
  opacity: 0;
}

/* 通过按钮动画 - 下一篇文章由小放大出现在原位置 */
.article-display.pass-enter.active {
  transform: scale(1);
  opacity: 1;
  animation: scaleIn 0.4s ease-out forwards;
}

.article-display.pass-enter:not(.active) {
  transform: scale(0);
  opacity: 0;
}

/* 退回按钮动画 - 当前文章缩小并向上方滑出（距离更远） */
.article-display.revise-exit.active {
  transform: scale(0.3) translateY(-100%);
  opacity: 0;
}

/* 退回按钮动画 - 下一篇文章由小放大出现在原位置 */
.article-display.revise-enter.active {
  transform: scale(1);
  opacity: 1;
  animation: scaleIn 0.5s ease-out forwards;
}

.article-display.revise-enter:not(.active) {
  transform: scale(0);
  opacity: 0;
}

/* 枪毙按钮动画 - 当前文章向下方滑出（距离更远） */
.article-display.report-exit.active {
  transform: translateY(150%);
  opacity: 0;
}

/* 枪毙按钮动画 - 下一篇文章由小放大出现在原位置 */
.article-display.report-enter.active {
  transform: scale(1);
  opacity: 1;
  animation: scaleIn 0.5s ease-out forwards;
}

.article-display.report-enter:not(.active) {
  transform: scale(0);
  opacity: 0;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* 射击模式 - 鼠标变为瞄准准心 */
.article-display.shooting-mode {
  cursor: crosshair;
}

/* 晃动动画 - 模拟枪支后坐力 */
.game-layout.shaking {
  animation: shake 0.1s ease-in-out 10;
}

@keyframes shake {
  0%, 100% { transform: translateX(0) translateY(0); }
  25% { transform: translateX(-5px) translateY(-5px); }
  50% { transform: translateX(5px) translateY(5px); }
  75% { transform: translateX(-3px) translateY(3px); }
}

/* 弹孔效果 */
.bullet-hole {
  position: absolute;
  width: 40px;
  height: 40px;
  background: radial-gradient(circle, transparent 0%, rgba(0, 0, 0, 0.8) 50%, transparent 100%);
  border-radius: 50%;
  pointer-events: none;
  animation: bulletHoleAppear 0.3s ease-out;
  z-index: 10;
}

@keyframes bulletHoleAppear {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
}

/* 玻璃破碎效果 */
.bullet-hole::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, transparent 0%, rgba(255, 255, 255, 0.3) 30%, transparent 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: glassBreak 0.5s ease-out;
}

@keyframes glassBreak {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0.6;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

.modal-overlay.show {
  display: flex;
}

/* 明细弹窗样式 */
.modal-content.detail-modal {
  max-width: 800px;
}

.detail-content {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.detail-item {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.article-number {
  font-weight: bold;
  color: #00ffff;
}

.result {
  font-weight: bold;
}

.result.correct {
  color: #00ff00;
}

.result.incorrect {
  color: #ff0000;
}

.detail-info {
  font-size: 14px;
  line-height: 1.6;
}

.detail-row {
  display: flex;
  margin-bottom: 8px;
}

.detail-label {
  width: 80px;
  font-weight: bold;
  color: #00ffff;
}

.detail-value {
  flex: 1;
  word-break: break-word;
  white-space: pre-line;
}

.tech-button.secondary {
  background: rgba(0, 255, 255, 0.2);
  border-color: rgba(0, 255, 255, 0.5);
  margin-right: 10px;
}

.tech-button.secondary:hover {
  background: rgba(0, 255, 255, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .game-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    height: auto;
  }
  
  .top-status {
    font-size: 18px;
  }
  
  .notebook-button {
    width: 180px;
    height: 240px;
  }
}</style>