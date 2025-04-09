export function formatDuration(seconds: number): string {
    const min = Math.floor(seconds / 60);
    const sec = Math.round(seconds % 60);
    return `${min}m ${sec < 10 ? "0" : ""}${sec}s`;
  }
  
  export function formatPace(secondsPerKm: number): string {
    const min = Math.floor(secondsPerKm / 60);
    const sec = Math.round(secondsPerKm % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec} /km`;
  }
  