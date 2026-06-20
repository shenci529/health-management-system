<template>
  <div class="basketball-game">
    <div class="scoreboard">
      <div class="team home-team">
        <div class="team-logo">GS</div>
        <div class="team-info">
          <div class="team-name">GS</div>
          <div class="team-score">9</div>
        </div>
      </div>
      <div class="game-info">
        <div class="quarter">第1节</div>
        <div class="timer">1:54</div>
        <div class="shot-clock">19</div>
      </div>
      <div class="team away-team">
        <div class="team-info">
          <div class="team-name">SA</div>
          <div class="team-score">13</div>
        </div>
        <div class="team-logo sa-logo">SA</div>
      </div>
    </div>

    <div class="court">
      <div class="court-bg"></div>
      <div class="players">
        <div class="player player-1" :style="{ left: '30%', top: '40%' }">
          <div class="player-body" :class="['blue-jersey']">
            <div class="player-number">20</div>
            <div class="player-name">BARNES</div>
          </div>
        </div>
        <div class="player player-2" :style="{ left: '45%', top: '50%' }">
          <div class="player-body" :class="['white-jersey']">
            <div class="player-number">10</div>
            <div class="player-name">DEMAR</div>
          </div>
        </div>
        <div class="player player-3" :style="{ left: '55%', top: '35%' }">
          <div class="player-body" :class="['blue-jersey']">
            <div class="player-number">11</div>
            <div class="player-name">THOMPSON</div>
          </div>
        </div>
        <div class="player player-4" :style="{ left: '65%', top: '55%' }">
          <div class="player-body" :class="['white-jersey']">
            <div class="player-number">1</div>
            <div class="player-name">WEMBY</div>
          </div>
        </div>
        <div class="player player-5" :style="{ left: '75%', top: '45%' }">
          <div class="player-body" :class="['blue-jersey']">
            <div class="player-number">30</div>
            <div class="player-name">CURRY</div>
          </div>
        </div>
        <div class="player player-6" :style="{ left: '50%', top: '65%' }">
          <div class="player-body" :class="['white-jersey']">
            <div class="player-number">2</div>
            <div class="player-name">WHITE</div>
          </div>
        </div>
        <div class="player player-7" :style="{ left: '40%', top: '60%' }">
          <div class="player-body" :class="['blue-jersey']">
            <div class="player-number">23</div>
            <div class="player-name">GREEN</div>
          </div>
        </div>
        <div class="player player-8" :style="{ left: '70%', top: '60%' }">
          <div class="player-body" :class="['white-jersey']">
            <div class="player-number">33</div>
            <div class="player-name">JONES</div>
          </div>
        </div>
      </div>

      <div class="basket-hoop" :style="{ left: '85%', top: '25%' }">
        <div class="backboard"></div>
        <div class="rim"></div>
        <div class="net"></div>
      </div>

      <div class="controls">
        <div class="joystick">
          <div class="joystick-base"></div>
          <div class="joystick-knob" :style="joystickStyle"></div>
        </div>

        <div class="action-buttons">
          <div class="button-group">
            <button class="action-btn shoot-btn" @touchstart="handleShoot" @mousedown="handleShoot">
              <div class="btn-icon">🏀</div>
              <span class="btn-text">投篮</span>
            </button>
            <button class="action-btn pass-btn" @touchstart="handlePass" @mousedown="handlePass">
              <div class="btn-icon">➡️</div>
              <span class="btn-text">传球</span>
            </button>
            <button class="action-btn screen-btn" @touchstart="handleScreen" @mousedown="handleScreen">
              <div class="btn-icon">🛡️</div>
              <span class="btn-text">呼叫掩护</span>
            </button>
            <button class="action-btn lob-btn" @touchstart="handleLob" @mousedown="handleLob">
              <div class="btn-icon">⬆️</div>
              <span class="btn-text">高吊传球</span>
            </button>
          </div>
          <button class="action-btn dribble-btn" @touchstart="handleDribble" @mousedown="handleDribble">
            <div class="btn-icon">⚡</div>
            <span class="btn-text">运球/背身单打</span>
          </button>
        </div>
      </div>

      <div class="energy-bar">
        <div class="energy-fill" :style="{ width: energy + '%' }"></div>
      </div>

      <div class="message-toast" v-if="showMessage">
        {{ messageText }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BasketballGame',
  data() {
    return {
      joystickX: 0,
      joystickY: 0,
      energy: 85,
      showMessage: false,
      messageText: '',
      joystickActive: false,
      joystickStartX: 0,
      joystickStartY: 0
    }
  },
  computed: {
    joystickStyle() {
      return {
        transform: `translate(${this.joystickX}px, ${this.joystickY}px)`
      }
    }
  },
  methods: {
    handleJoystickStart(e) {
      this.joystickActive = true
      const touch = e.touches ? e.touches[0] : e
      this.joystickStartX = touch.clientX
      this.joystickStartY = touch.clientY
    },
    handleJoystickMove(e) {
      if (!this.joystickActive) return
      const touch = e.touches ? e.touches[0] : e
      const dx = touch.clientX - this.joystickStartX
      const dy = touch.clientY - this.joystickStartY
      const distance = Math.sqrt(dx * dx + dy * dy)
      const maxDistance = 50
      if (distance > maxDistance) {
        this.joystickX = (dx / distance) * maxDistance
        this.joystickY = (dy / distance) * maxDistance
      } else {
        this.joystickX = dx
        this.joystickY = dy
      }
    },
    handleJoystickEnd() {
      this.joystickActive = false
      this.joystickX = 0
      this.joystickY = 0
    },
    handleShoot() {
      this.showMessageToast('投篮！')
      this.consumeEnergy(10)
    },
    handlePass() {
      this.showMessageToast('传球成功！')
      this.consumeEnergy(5)
    },
    handleScreen() {
      this.showMessageToast('呼叫掩护！')
      this.consumeEnergy(8)
    },
    handleLob() {
      this.showMessageToast('高吊传球！')
      this.consumeEnergy(12)
    },
    handleDribble() {
      this.showMessageToast('运球过人！')
      this.consumeEnergy(6)
    },
    consumeEnergy(amount) {
      this.energy = Math.max(0, this.energy - amount)
      setTimeout(() => {
        this.energy = Math.min(100, this.energy + amount / 2)
      }, 2000)
    },
    showMessageToast(text) {
      this.messageText = text
      this.showMessage = true
      setTimeout(() => {
        this.showMessage = false
      }, 1500)
    }
  },
  mounted() {
    window.addEventListener('mousemove', this.handleJoystickMove)
    window.addEventListener('mouseup', this.handleJoystickEnd)
    window.addEventListener('touchmove', this.handleJoystickMove)
    window.addEventListener('touchend', this.handleJoystickEnd)
  },
  beforeDestroy() {
    window.removeEventListener('mousemove', this.handleJoystickMove)
    window.removeEventListener('mouseup', this.handleJoystickEnd)
    window.removeEventListener('touchmove', this.handleJoystickMove)
    window.removeEventListener('touchend', this.handleJoystickEnd)
  }
}
</script>

<style scoped>
.basketball-game {
  width: 100%;
  height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  overflow: hidden;
  position: relative;
}

.scoreboard {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  z-index: 100;
}

.team {
  display: flex;
  align-items: center;
  gap: 15px;
}

.team-logo {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  color: #1a1a2e;
  border: 2px solid #FFD700;
}

.sa-logo {
  background: linear-gradient(135deg, #C0C0C0, #808080);
  color: #1a1a2e;
  border-color: #C0C0C0;
}

.team-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.team-name {
  font-size: 14px;
  color: #909399;
}

.team-score {
  font-size: 32px;
  font-weight: bold;
  color: #fff;
}

.game-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.quarter {
  font-size: 12px;
  color: #909399;
}

.timer {
  font-size: 36px;
  font-weight: bold;
  color: #fff;
  font-family: 'Courier New', monospace;
}

.shot-clock {
  font-size: 18px;
  color: #FF6B6B;
  font-weight: bold;
}

.court {
  width: 100%;
  height: 100%;
  position: relative;
}

.court-bg {
  position: absolute;
  top: 70px;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1e3a5f 0%, #0d2137 100%);
  background-image: 
    radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 50%),
    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px),
    linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 100% 100%, 50px 50px, 50px 50px;
}

.court-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    ellipse(60% 40% at 50% 50%);
  opacity: 0.05;
}

.court-bg::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(255,255,255,0.1);
}

.players {
  position: absolute;
  top: 70px;
  left: 0;
  right: 0;
  bottom: 0;
}

.player {
  position: absolute;
  transition: all 0.3s ease;
}

.player-body {
  width: 60px;
  height: 80px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 4px 15px rgba(0,0,0,0.5);
}

.blue-jersey {
  background: linear-gradient(180deg, #1D428A 0%, #006BB6 100%);
  border: 2px solid #FFD700;
}

.white-jersey {
  background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 100%);
  border: 2px solid #000;
}

.player-number {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
}

.white-jersey .player-number {
  color: #000;
}

.player-name {
  font-size: 10px;
  color: #fff;
  text-align: center;
  margin-top: 2px;
}

.white-jersey .player-name {
  color: #000;
}

.basket-hoop {
  position: absolute;
}

.backboard {
  width: 80px;
  height: 45px;
  background: rgba(255,255,255,0.9);
  border: 3px solid #FF6B6B;
  border-radius: 5px;
  position: relative;
}

.rim {
  width: 50px;
  height: 10px;
  background: #FF6B6B;
  border-radius: 5px;
  position: absolute;
  top: 45px;
  left: 15px;
}

.net {
  width: 50px;
  height: 30px;
  background: repeating-linear-gradient(90deg, #fff 0px, #fff 2px, transparent 2px, transparent 4px);
  position: absolute;
  top: 55px;
  left: 15px;
  opacity: 0.8;
}

.controls {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 100;
}

.joystick {
  width: 120px;
  height: 120px;
  position: relative;
}

.joystick-base {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  border: 3px solid rgba(255,255,255,0.3);
  position: absolute;
  top: 0;
  left: 0;
}

.joystick-knob {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  border: 3px solid #fff;
  position: absolute;
  top: 35px;
  left: 35px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.5);
  transition: transform 0.1s ease;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 15px;
}

.button-group {
  display: flex;
  gap: 10px;
}

.action-btn {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: rgba(0,0,0,0.6);
  border: 2px solid rgba(255,255,255,0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:active {
  transform: scale(0.9);
  background: rgba(255,215,0,0.3);
  border-color: #FFD700;
}

.btn-icon {
  font-size: 20px;
}

.btn-text {
  font-size: 10px;
  color: #fff;
  margin-top: 2px;
}

.dribble-btn {
  width: 90px;
  height: 90px;
  background: rgba(255,69,0,0.7);
  border-color: #FF4500;
}

.dribble-btn .btn-icon {
  font-size: 24px;
}

.dribble-btn .btn-text {
  font-size: 11px;
}

.energy-bar {
  position: absolute;
  bottom: 160px;
  left: 20px;
  width: 100px;
  height: 10px;
  background: rgba(0,0,0,0.5);
  border-radius: 5px;
  overflow: hidden;
}

.energy-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF6B6B, #FFD700, #67C23A);
  border-radius: 5px;
  transition: width 0.3s ease;
}

.message-toast {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0,0,0,0.8);
  color: #FFD700;
  padding: 15px 30px;
  border-radius: 10px;
  font-size: 24px;
  font-weight: bold;
  animation: toastIn 0.3s ease;
  z-index: 200;
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@media (max-width: 768px) {
  .scoreboard {
    height: 60px;
    padding: 0 10px;
  }
  
  .team-logo {
    width: 40px;
    height: 40px;
    font-size: 14px;
  }
  
  .team-score {
    font-size: 24px;
  }
  
  .timer {
    font-size: 28px;
  }
  
  .controls {
    padding: 0 10px;
  }
  
  .joystick {
    width: 100px;
    height: 100px;
  }
  
  .joystick-knob {
    width: 40px;
    height: 40px;
    top: 30px;
    left: 30px;
  }
  
  .action-btn {
    width: 55px;
    height: 55px;
  }
  
  .dribble-btn {
    width: 70px;
    height: 70px;
  }
  
  .player-body {
    width: 45px;
    height: 60px;
  }
  
  .player-number {
    font-size: 18px;
  }
  
  .player-name {
    font-size: 8px;
  }
}
</style>