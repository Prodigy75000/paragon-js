export const DEBUG = {
  // 🟩 Core systems (safe to leave on during development)
  general: true, // lifecycle, view switches, manager init, saves

  // 🟨 Medium verbosity (use occasionally)
  draw: false,   // per-frame rendering or update logs
  touch: false,  // zone registration, pointer hits/misses
  verbose: false, // spammy detailed logs (pointermove, delta updates, etc.)

  // 🟥 Emergency / profiling (rarely used)
  perf: false,   // FPS, frame times, memory tracking
};