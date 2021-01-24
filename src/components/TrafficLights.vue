<script>
export default {
  name: 'TrafficLights',
  data: () => ({
    currentStateName: null,
    countdown: 0,
    states: {
      red: {
        countdown: 10,
        nextOnCountdown: 3,
        lights: {
          red: true,
          yellow: false,
          green: false,
        },
        next: 'redAndYellow'
      },
      redAndYellow: {
        nextOnCountdown: 0,
        lights: {
          red: true,
          yellow: true,
          green: false,
        },
        next: 'green'
      },
      green: {
        countdown: 15,
        nextOnCountdown: 5,
        lights: {
          red: false,
          yellow: false,
          green: true,
        },
        next: 'blinkingGreen'
      },
      blinkingGreen: {
        nextOnCountdown: 0,
        blinking: [
          'green'
        ],
        lights: {
          red: false,
          yellow: false,
          green: true,
        },
        next: 'yellow'
      },
      yellow: {
        countdown: 3,
        nextOnCountdown: 0,
        disableCountdown: true,
        lights: {
          red: false,
          yellow: true,
          green: false,
        },
        next: 'red'
      }
    }
  }),
  created() {
    this.checkParams()
    this.init()
  },
  computed: {
    state() {
      return this.states[this.currentStateName]
    },
    countdownFormatted() {
      return this.countdown < 10 ? `0${this.countdown}` : this.countdown
    },
  },
  methods: {
    init() {
      setInterval(() => {
        if (this.countdown) {
          this.countdown -= 1
        }

        if (this.countdown === this.state.nextOnCountdown) {
          this.currentStateName = this.state.next
      
          this.setState()
        }

        this.saveState()
      }, 1000)
    },
    setState(countdown = null) {
      if (countdown) {
        this.countdown = countdown
      } else if (this.state.countdown) {
        this.countdown = this.state.countdown
      }

      if (this.$route.params.state !== this.currentStateName) {
        this.$router.replace({
          name: 'state',
          params: {
            state: this.currentStateName
          }
        })
      }
      
      if (this.state.blinking) {
        this.blinking = setInterval(() => {
          this.state.blinking.forEach(light => {
            this.states[this.currentStateName].lights[light] = !this.states[this.currentStateName].lights[light]
          })
        }, 500)
      } else if (this.blinking) {
        clearInterval(this.blinking)
      }
    },
    loadState() {
      const local = localStorage.getItem('vtl-state')

      if (local) {
        const [
          state,
          countdown
        ] = local.split(':')

        if (this.states[state]) {
          return {
            state,
            countdown: parseInt(countdown)
          }
        }
      }

      return false
    },
    saveState() {
      localStorage.setItem('vtl-state', `${this.currentStateName}:${this.countdown}`)
    },
    checkParams() {
      const { state } = this.$route.params

      if (this.states[state]) {
        this.currentStateName = state
        this.setState()
      } else {
        const localData = this.loadState()

        if (localData) {
          this.currentStateName = localData.state
          this.setState(localData.countdown)

          this.$router.push({
            name: 'state',
            params: {
              state: localData.state
            }
          })
        } else {
          this.$router.replace({
            name: 'state',
            params: {
              state: 'red'
            }
          })
        }
      }
    }
  }
}
</script>
<template>
  <div class="traffic-lights">
    <div 
      v-if="currentStateName"
      class="traffic-lights__lamps"
    >
      <div 
        class="traffic-lights__lamp"
        :class="{
          'traffic-lights__lamp--prohibiting': state.lights.red
        }"
      />
      <div 
        class="traffic-lights__lamp"
        :class="{
          'traffic-lights__lamp--warning': state.lights.yellow
        }"
      />
      <div 
        class="traffic-lights__lamp"
        :class="{
          'traffic-lights__lamp--permissive': state.lights.green
        }"
      />
    </div>
    <div
      v-if="currentStateName"
      class="traffic-lights__timer"
      :class="{
        'traffic-lights__timer--prohibiting': state.lights.red,
        'traffic-lights__timer--permissive': state.lights.green,
      }"
    >
      <span v-if="!state.disableCountdown">
        {{ countdownFormatted }}
      </span>
    </div>
  </div>
</template>
<style src="@/assets/styles/components/traffic-lights.scss" lang="scss"></style>