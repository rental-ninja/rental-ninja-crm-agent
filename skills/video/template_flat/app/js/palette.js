// Coral & Navy: the logo's coral as the hero accent, the app's navy as the dark, warm cream walls, a dusty sky blue as the backdrop.
Object.assign(C, {
  teal: '#6C9DD2', tealD: '#4675AA', tealL: '#B3CDEA', tealXL: '#E3EDF6',
  navy: '#0D2B4E', navyL: '#1F416B', navyM: '#3E5C86', navyD: '#081A31', ink: '#0D2B4E', night: '#173A63',
  wall: '#EADFCC', wallD: '#D5C5AC', wallL: '#F5EEE2', white: '#FFFBF5', sky: '#F8F2E8', sand: '#EBDCC6', cream: '#F3E8D8',
  grey: '#B8AFA3', greyD: '#877E73', greyL: '#EEE7DC', stone: '#A59C90', line: '#E2D8C9', mute: '#6A6E7C',
  coral: '#F5515F', coralD: '#C42338', coralL: '#FBC6C4', coralXL: '#FDE6E1',
  orange: '#E57335', orangeD: '#C95F28', orangeL: '#FDCFAE', mustard: '#F2B23E', glow: '#F8D27E',
  pink: '#C9607E', green: '#3E9E78', greenL: '#D3EEDF', blue: '#2885D6', purple: '#7660C6', purpleL: '#DCD3F2', purpleXL: '#F0EBFA',
  red: '#EC2B3B', redD: '#B3122A', redL: '#FBD3D6',
  airbnb: '#E8436B', booking: '#1F4E9C', vrbo: '#2A85A0', kraft: '#D7A56B', kraftD: '#B9864D', peach: '#FFE6D4',
});
Object.assign(FOLKS.host, { top: '#F2B23E', bottom: '#9DB8DA' });
Object.assign(FOLKS.ginger, { top: '#FFFBF5', bottom: '#D93A4A', collar: C.navy });
Object.assign(FOLKS.beard, { top: '#B9506A', bottom: '#6E4E3C' });
Object.assign(FOLKS.cleaner, { top: '#3E9E78', bottom: '#1F416B', apron: '#FFFBF5' });
Object.assign(FOLKS.owner, { top: '#4F6B80', bottom: '#5E5246' });
Object.assign(FOLKS.blonde, { top: '#7660C6', bottom: '#1F416B' });
Object.assign(FOLKS.dad, { top: '#2885D6', bottom: '#C9B79A' });
Object.assign(FOLKS.tech, { top: '#E57335', bottom: '#1F416B' });

/* Hard-coded hex in the film that became tokens (patched in lab/palette/film; new keys declared in flat.js with the old values):
 * flat.js:64  #D9DEE3 -> C.line
 * world.js:45  #3B415C -> C.navyL
 * world.js:46,64,64  #FBE6B5 -> C.glow
 * world.js:178  #F6D7BD -> C.peach
 * scenes_f1.js:9,20,165,173  #F2F4F5 -> C.sky
 * scenes_f1.js:73,73  #F6C8B8 -> C.coralL
 * scenes_f1.js:85  #F6C0C0 -> C.coralL
 * scenes_f1.js:85,157  #DDEFE5 -> C.greenL
 * scenes_f1.js:98  #FFE27A -> C.glow
 * scenes_f1.js:98  #FFC9A8 -> C.orangeL
 * scenes_f1.js:98  #BFE8C8 -> C.greenL
 * scenes_f1.js:98  #F9C4D2 -> C.coralL
 * scenes_f1.js:134,135,138,139  #F4E4B0 -> C.glow
 * scenes_f1.js:137  #EEF2F5 -> C.wallL
 * scenes_f1.js:142  #E3F1F0 -> C.tealXL
 * scenes_f1.js:153  #F1ECE3 -> C.cream
 * scenes_f1.js:173  #F8E3E0 -> C.coralXL
 * scenes_f1.js:191  #FFE8A8 -> C.glow
 * scenes_f1.js:191  #5B3A00 -> C.ink
 * scenes_f1.js:219,219,219  #E38A57 -> C.orangeD
 * scenes_f1.js:232  #4E9FA3 -> C.tealD
 * scenes_f1.js:252,252  #151827 -> C.navyD
 * scenes_f1.js:263,274  #0F1220 -> C.navyD
 * scenes_f2.js:36  #F4F6F7 -> C.white
 * scenes_f2.js:74  #F2ECE3 -> C.cream
 * scenes_f2.js:88  #DDF0E2 -> C.greenL
 * scenes_f2.js:129,256  #F5F7F8 -> C.white
 * scenes_f2.js:133,141  #EFEAFB -> C.purpleXL
 * scenes_f2.js:169  #EEF1F3 -> C.wallL
 * scenes_f2.js:192  #0F1220 -> C.navyD
 * scenes_f2.js:216  #DCD6F3 -> C.purpleL
 * scenes_f2.js:249,249,249  #E38A57 -> C.orangeD
 * scenes_f3.js:5  #F2F4F5 -> C.sky
 * scenes_f3.js:29,61,157  #F5F7F8 -> C.white
 * scenes_f3.js:63  #FFF1E6 -> C.coralXL
 * scenes_f3.js:130  #DDF0E2 -> C.greenL
 * scenes_f3.js:149  #E9E4DA -> C.sand
 * scenes_f3.js:152,152,152  #E38A57 -> C.orangeD
 * scenes_f4.js:12,42  #F5F7F8 -> C.white
 * scenes_f4.js:54,68,76  #F2F4F5 -> C.sky
 * scenes_f4.js:117  #D9A66B -> C.kraft
 * scenes_f4.js:117  #C48F55 -> C.kraftD
 * scenes_f4.js:150,150  #151827 -> C.navyD
 * scenes_f4.js:158  #0F1220 -> C.navyD
 * main_flat.js:22,66  vignette rgba(20,24,40) / fade rgba(14,16,26) -> rgbA(C.navyD, a)
 * kept literal: '#fff'/'#FFFFFF' (text on accents, flashes) and the hand skins '#F2C6A0', '#F4CDB0' (scenes_f2:128, scenes_f3:60). */
