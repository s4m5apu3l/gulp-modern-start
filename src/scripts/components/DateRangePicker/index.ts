/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    $: any
    jQuery: any
    moment: any
    initCustomDatepicker?: (root?: ParentNode) => void
    __datepickerResetBound?: boolean
  }
  // eslint-disable-next-line no-var
  var $: any
  // eslint-disable-next-line no-var
  var moment: any
}

const initCustomDatepicker = (root: ParentNode = document) => {
  const monthNames = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ]
  const dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
  const dayNamesMin = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

  $(function () {
    initDesktopDatepicker()

    function initDesktopDatepicker() {
      const datepickers = Array.from(root.querySelectorAll('.datepicker-range'))

      if (root instanceof HTMLElement && root.matches('.datepicker-range')) {
        datepickers.unshift(root)
      }

      $(datepickers).each(function (this: HTMLElement) {
        const $input = $(this)

        if ($input.data('datepicker-initialized')) {
          return
        }

        if (!$input.daterangepicker || typeof $input.daterangepicker !== 'function') {
          return
        }

        $input.data('datepicker-initialized', true)
        $input.daterangepicker({
          datepickerOptions: {
            showCurrentAtPos: 0,
            numberOfMonths: 1,
            minDate: 0,
            maxDate: null,
            showOn: 'focus',
            firstDay: 1,
            monthNames: monthNames,
            dayNames: dayNames,
            dayNamesMin: dayNamesMin,
          },
          isRange: true,
          dateFormat: 'dd.mm.yy',
          initialText: ($input.data('initial-text') as string) || 'Дата',
          applyButtonText: 'Показать',
          clearButtonText: 'Сбросить',
          cancelButtonText: '',
          autoFitCalendars: true,
          presetRanges: [
            {
              text: 'Сегодня',
              dateStart: function () {
                return moment()
              },
              dateEnd: function () {
                return moment()
              },
            },
            {
              text: 'Завтра',
              dateStart: function () {
                return moment().add('days', 1)
              },
              dateEnd: function () {
                return moment().add('days', 1)
              },
            },
            {
              text: 'Неделя',
              dateStart: function () {
                return moment()
              },
              dateEnd: function () {
                return moment().add(6, 'days')
              },
            },
          ],
          icon: 'custom-date-icon',
        })
      })
    }

    if (!window.__datepickerResetBound) {
      window.__datepickerResetBound = true
      document.addEventListener('filtersReset', () => {
        $('.datepicker-range').each(function (this: HTMLElement) {
          const $input = $(this)

          try {
            if ($input.daterangepicker && typeof $input.daterangepicker === 'function') {
              $input.daterangepicker('clearRange')
            }
          } catch (e) {
            console.warn('DatePicker clearRange error:', e)
          }

          $input.val('')
          $input.trigger('change')
        })
      })
    }
  })
}

window.initCustomDatepicker = initCustomDatepicker

export default initCustomDatepicker
