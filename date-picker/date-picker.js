/**
 * 自定义日期选择器组件
 * 年、月、日三个按钮，点击弹出底部列表选择
 */

// pages/components/date-picker/date-picker.js
Component({
  properties: {
    value: {
      type: String,
      value: ''
    }
  },

  data: {
    selectedYear: '',
    selectedMonth: '',
    selectedDay: '',
    years: [],
    months: [],
    days: [],

    // 弹窗状态
    showYearPicker: false,
    showMonthPicker: false,
    showDayPicker: false,

    // 当前选择的类型（用于点击遮罩时关闭）
    activePicker: ''
  },

  lifetimes: {
    attached() {
      this.initData()
      this.parseInitialValue()
    }
  },

  methods: {
    // 初始化数据
    initData() {
      const currentYear = new Date().getFullYear()
      const years = []
      for (let y = 1950; y <= currentYear; y++) {
        years.push(y)
      }
      this.setData({ years })

      const months = []
      for (let m = 1; m <= 12; m++) {
        months.push(m)
      }
      this.setData({ months })

      // 默认选中当前日期
      const now = new Date()
      this.setData({
        selectedYear: now.getFullYear(),
        selectedMonth: now.getMonth() + 1,
        selectedDay: now.getDate()
      }, () => {
        this.updateDays()
        this.emitChange()
      })
    },

    // 解析初始值
    parseInitialValue() {
      const { value } = this.data
      if (value && typeof value === 'string' && value.includes('-')) {
        const parts = value.split('-')
        if (parts.length === 3) {
          this.setData({
            selectedYear: parseInt(parts[0]),
            selectedMonth: parseInt(parts[1]),
            selectedDay: parseInt(parts[2])
          }, () => {
            this.updateDays()
          })
        }
      }
    },

    // 更新天数（根据年月）
    updateDays() {
      const { selectedYear, selectedMonth } = this.data
      if (!selectedYear || !selectedMonth) return

      const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate()
      const days = []
      for (let d = 1; d <= daysInMonth; d++) {
        days.push(d)
      }
      this.setData({ days })

      // 如果当前选中天数超出范围，重置
      if (this.data.selectedDay > daysInMonth) {
        this.setData({ selectedDay: daysInMonth })
      }
    },

    // 点击年份按钮
    onYearTap() {
      console.log('点击年份按钮')
      this.setData({
        showYearPicker: true,
        showMonthPicker: false,
        showDayPicker: false,
        activePicker: 'year'
      })
    },

    // 点击月份按钮
    onMonthTap() {
      console.log('点击月份按钮')
      this.setData({
        showYearPicker: false,
        showMonthPicker: true,
        showDayPicker: false,
        activePicker: 'month'
      })
    },

    // 点击日期按钮
    onDayTap() {
      console.log('点击日期按钮')
      this.setData({
        showYearPicker: false,
        showMonthPicker: false,
        showDayPicker: true,
        activePicker: 'day'
      })
    },

    // 选择年份
    onSelectYear(e) {
      const year = e.currentTarget.dataset.year
      console.log('选择年份:', year)
      this.setData({ selectedYear: year }, () => {
        this.updateDays()
        this.closePicker()
        this.emitChange()
      })
    },

    // 选择月份
    onSelectMonth(e) {
      const month = e.currentTarget.dataset.month
      console.log('选择月份:', month)
      this.setData({ selectedMonth: month }, () => {
        this.updateDays()
        this.closePicker()
        this.emitChange()
      })
    },

    // 选择日期
    onSelectDay(e) {
      const day = e.currentTarget.dataset.day
      console.log('选择日期:', day)
      this.setData({ selectedDay: day }, () => {
        this.closePicker()
        this.emitChange()
      })
    },

    // 关闭弹窗
    closePicker() {
      this.setData({
        showYearPicker: false,
        showMonthPicker: false,
        showDayPicker: false,
        activePicker: ''
      })
    },

    // 点击遮罩层
    onMaskTap() {
      console.log('点击遮罩层')
      this.closePicker()
    },

    // 阻止冒泡
    onPreventBubble() {
      // 空方法，仅用于阻止事件冒泡
    },

    // 触发变更事件
    emitChange() {
      const { selectedYear, selectedMonth, selectedDay } = this.data
      if (selectedYear && selectedMonth && selectedDay) {
        const monthStr = String(selectedMonth).padStart(2, '0')
        const dayStr = String(selectedDay).padStart(2, '0')
        const dateStr = `${selectedYear}-${monthStr}-${dayStr}`
        this.triggerEvent('change', { value: dateStr })
      }
    }
  }
})
