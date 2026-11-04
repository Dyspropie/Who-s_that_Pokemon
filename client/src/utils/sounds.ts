// Web Audio API Synthesizer & Authentic Pokémon Audio Controller
class SoundController {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private whosThatPokemonAudio: HTMLAudioElement | null = null;

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.whosThatPokemonAudio) {
      this.whosThatPokemonAudio.pause();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Play the original "Who's That Pokémon?!" anime sound effect
   */
  public playWhosThatPokemon() {
    if (this.isMuted) return;
    try {
      if (!this.whosThatPokemonAudio) {
        this.whosThatPokemonAudio = new Audio('/audio/whos_that_pokemon.mp3');
      }
      this.whosThatPokemonAudio.currentTime = 0;
      this.whosThatPokemonAudio.volume = 0.8;
      this.whosThatPokemonAudio.play().catch(e => {
        console.warn('Could not play Who\'s That Pokémon audio:', e);
      });
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  public playTick() {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  public playCorrect() {
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);

      gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.15);
    });
  }

  public playWrong() {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  }

  public playPokemonCry(url?: string) {
    if (this.isMuted || !url) return;
    try {
      const audio = new Audio(url);
      audio.volume = 0.6;
      audio.play().catch(e => console.warn('Could not play cry audio:', e));
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }
}

export const sounds = new SoundController();
