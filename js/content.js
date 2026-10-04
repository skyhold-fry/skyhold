/* Hand-written app content for Skyhold (Sky version). Sources: design-brief.md, tough-moment.md,
   side-quests.md, couple-quests.md. Names marked "placeholder" are pending Snow/Carson. */
window.C = (function(){
const SCALE='🐉';
// ---- Familiars (Sky): each partner picks 1 of 4; the rest unlock in the Hoard -------------
// Carson asked for a dire cat (Oct 4), so Sky's four are dragon, falcon, wolf pup, dire cat.
const familiars = {
  dragon:{kind:'dragon',emoji:'🐉',name:'Baby dragon',stages:['baby dragon','young dragon','grown dragon'],hint:'Warm, curious, naps on the map table.',
    treats:[{id:'fish',e:'🐟',n:'Roasted fish skewers',cost:8},{id:'pepper',e:'🌶️',n:'Fire-pepper bites',cost:8},{id:'ember',e:'🪨',n:'Warm ember stones',cost:10}],suggest:'Cinder',cost:150},
  falcon:{kind:'falcon',emoji:'🦅',name:'Falcon',stages:['falcon chick (eyas)','young falcon','grown falcon'],hint:'Sharp-eyed scout who rides on your shoulder.',
    treats:[{id:'quail',e:'🍗',n:'Quail bites',cost:8},{id:'mouse',e:'🐭',n:'Mouse-shaped treats',cost:8},{id:'cricket',e:'🦗',n:'Cricket snacks',cost:8}],suggest:'Skye',cost:150},
  wolf:{kind:'wolf',emoji:'🐺',name:'Wolf pup',stages:['wolf pup','young wolf','grown wolf'],hint:'Loyal, loves a long walk on the battlements.',
    treats:[{id:'lean',e:'🥩',n:'Lean meat bites',cost:8},{id:'salmon',e:'🍣',n:'Salmon pieces',cost:8},{id:'bone',e:'🦴',n:'A big chew bone',cost:10}],suggest:'Ash',cost:150},
  direcat:{kind:'direcat',emoji:'🐈‍⬛',name:'Dire cat',stages:['dire cat kitten','young dire cat','grown dire cat'],hint:'A big, gentle prowler (Carson’s pick). Purrs like a drum.',
    treats:[{id:'venison',e:'🥩',n:'Lean venison bites',cost:8},{id:'chicken',e:'🍗',n:'Cooked chicken chunks',cost:8},{id:'chew',e:'🦴',n:'A big beef chew',cost:10}],suggest:'Shadow',cost:200},
};
const stageOf = lv => lv>=10?2:lv>=5?1:0;   // Lv 1-4 baby · 5-9 young · 10+ grown
// ---- Side-quest areas -----------------------------------------------------------------
const areas = [
  {id:'SP',key:'spiritual',name:'Shield of Faith',label:'SPIRITUAL',icon:'✨',grow:'Shield brightness',unit:'brightness',crop:'95,120,240',keep:'chapel glowing'},
  {id:'SO',key:'social',name:'Fellowship Hall',label:'SOCIAL',icon:'🛡️',grow:'Next crest stone',unit:'crest stones',crop:'490,240,240',keep:'crest stones'},
  {id:'PH',key:'physical',name:'Training Grounds',label:'PHYSICAL',icon:'⚔️',grow:'Next training gear',unit:'gear',crop:'200,270,300',keep:'gear'},
  {id:'IN',key:'intellectual',name:'Wisdom Tower',label:'INTELLECTUAL',icon:'📜',grow:'Next scroll',unit:'scrolls',crop:'440,40,180',keep:'scrolls'},
];
// Placeholders in the task pools, filled from each partner's private settings.
const fillDefaults = {snow:{Friend1:'Kenzie',Friend2:'a friend',Sibling1:'your sibling',Sibling2:'your other sibling',Mom:'Mom',Dad:'Dad',Coworker:'a coworker','Ward friend':'a ward friend',Book:'your current book'},
  carson:{Friend1:'a friend',Friend2:'another friend',Sibling1:'your sibling',Sibling2:'your other sibling',Mom:'Mom',Dad:'Dad',Coworker:'a classmate','Ward friend':'a ward friend',Book:'your current book'}};
// Tasks that only fit Snow's life (shifts, scrubs, TEAS); hidden for Carson until his pool arrives.
const snowOnly = /shift|scrub|TEAS|ALEKS|nurs|hospital|break room|charting/i;
// ---- Castle Keeping rotation (side-quests.md §5) -------------------------------------
const laundry = {1:{e:'🧺',s:'Wash darks',t:'Start a darks/scrubs load and move it to the dryer'},2:{e:'👕',s:'Fold Mon',t:'Fold and put away Monday’s load (all the way into drawers)'},
  3:{e:'🧺',s:'Wash lights',t:'Start a lights load and move it to the dryer'},4:{e:'👕',s:'Fold Wed',t:'Fold and put away Wednesday’s load'},
  5:{e:'🛁',s:'Towels',t:'Wash, dry, and put away one load of towels'},6:{e:'🛏️',s:'Sheets',t:'Wash the sheets and remake the bed'},0:{e:'🧦',s:'Sort basket',t:'Sort the basket into lights/darks (2 min)',light:true}};
const cleaning = {1:{e:'🚪',s:'Doorknobs',t:'Wipe the light switches, doorknobs, and fridge handle'},2:{e:'🚿',s:'Bath sink',t:'Wipe the bathroom sink + mirror'},
  3:{e:'🧹',s:'Sweep floor',t:'Vacuum or sweep the main room'},4:{e:'♨️',s:'Microwave',t:'Wipe the inside of the microwave'},
  5:{e:'👟',s:'Entry + rug',t:'Shoes on the rack + shake out the entry rug'},6:{e:'✨',s:'Deep clean',t:'',deep:true},0:{e:'🧸',s:'Pickup',t:'10-thing pickup',light:true}};
const deep = [{n:'bathroom',t:'Bathroom: scrub the toilet inside and out, then the shower or tub walls. Stop when the timer rings.'},
  {n:'floors',t:'Floors: vacuum every room, then mop the kitchen and bathroom. Stop when the timer rings.'},
  {n:'kitchen',t:'Kitchen: wipe the stovetop, the front of the appliances, and the counters, then clean the sink. Stop when the timer rings.'},
  {n:'bedroom',t:'Bedroom: clear the surfaces, dust, and vacuum under the bed. Stop when the timer rings.'}];
// ---- Hoard goods (Dragon Scales) & decor slots -----------------------------------------
const slots = [{id:'shelf',n:'Shelf'},{id:'seat',n:'Window seat'},{id:'rug',n:'Rug'},{id:'wall',n:'Wall hanging (banner)'},{id:'table',n:'Table'},{id:'corner',n:'Plant / corner'}];
const decor = [
  {id:'bluebanner',e:'🚩',n:'Royal blue banner',slot:'wall',cost:30,sub:'decoration · War Room wall'},
  {id:'redbanner',e:'🟥',n:'Deep crimson banner',slot:'wall',cost:30,sub:'decoration · War Room wall'},
  {id:'wreath',e:'🍂',n:'Harvest wreath',slot:'wall',cost:20,season:'autumn',sub:'seasonal · until Nov 30'},
  {id:'pumpkins',e:'🎃',n:'Lantern pumpkins',slot:'table',cost:25,season:'autumn',sub:'seasonal decoration'},
  {id:'candles',e:'🕯️',n:'Candle cluster',slot:'table',cost:15,sub:'decoration · map table'},
  {id:'scrolls',e:'📜',n:'Shelf of old scrolls',slot:'shelf',cost:35,sub:'decoration · shelf'},
  {id:'cushions',e:'🛋️',n:'Window-seat cushions',slot:'seat',cost:25,sub:'decoration · window seat'},
  {id:'furrug',e:'🟫',n:'Thick fur rug',slot:'rug',cost:40,sub:'decoration · by the fire'},
  {id:'fern',e:'🪴',n:'Potted fern',slot:'corner',cost:15,sub:'decoration · corner'},
  {id:'snowglobe',e:'❄️',n:'Frosted lantern',slot:'corner',cost:20,season:'winter',sub:'seasonal · winter'},
];
const charms = [{id:'shieldcharm',e:'🛡️',n:'Silver shield charm',area:'PH',cost:35,sub:'shield charm · Training Grounds'},{id:'nest',e:'🪺',n:'Warm ember-stone nest',cost:60,sub:'familiar comfort · cozier naps',comfort:true}];
// ---- Carson's ideas (texted Oct 4): XP bar, unlockable gear, cool facts --------------------
const gear = [ {lv:2,e:'🧤',n:'Squire’s leather gloves'},{lv:3,e:'👓',n:'Gold-rimmed battle spectacles'},{lv:4,e:'🧣',n:'Dark-red wool scarf'},
  {lv:5,e:'🧥',n:'Deep crimson cloak'},{lv:6,e:'🛡️',n:'Oak shield with a red dragon crest'},{lv:7,e:'🦾',n:'Dragon-scale bracers'},
  {lv:8,e:'⛑️',n:'Knight’s helm (visor up, glasses fit)'},{lv:10,e:'🗡️',n:'Emberbrand, a ruby-hilted sword'},{lv:12,e:'🐎',n:'A dark-red saddle for a future steed'} ];
const xpForLevel = lv => 25*(lv-1)*(lv-1);           // Lv2 at 25 XP, Lv3 at 100, Lv5 at 400 ...
const levelForXp = xp => Math.floor(Math.sqrt(xp/25))+1;
const facts = [
 'Octopuses have three hearts and blue blood.','Sealed honey can stay edible for thousands of years.',
 'A day on Venus is longer than its whole year.','Botanically, bananas are berries but strawberries are not.',
 'Sharks were around before trees existed.','A peregrine falcon’s hunting dive can top 200 mph, the fastest of any animal.',
 'Dover Castle’s Great Tower has walls up to about 21 feet thick.','A full suit of plate armor weighed about 45–55 lb, and knights could run and climb in it.',
 'The American lion, an Ice Age big cat, was larger than today’s African lion.','The Snake River Plain was shaped by the same hotspot that now sits under Yellowstone.',
 'Sunlight takes about 8 minutes and 20 seconds to reach Earth.','Your heart beats about 100,000 times a day.',
 'The Great Wall of China is not visible to the naked eye from the Moon.','A lightning bolt is about five times hotter than the surface of the Sun.',
 'A teaspoon of neutron-star material would weigh about a billion tons.','There are more possible chess games than atoms in the observable universe.',
 'The Eiffel Tower grows up to about 6 inches taller in summer heat.','Owls can’t move their eyes, so they turn their heads up to 270°.',
 'Sea otters hold hands while they sleep so they don’t drift apart.','Wombats make cube-shaped poop.',
 'Windsor Castle is the oldest and largest lived-in castle in the world.','“Here be dragons” appears on only one known old globe, the Hunt-Lenox Globe (about 1510).',
 'A puffy cumulus cloud can weigh over a million pounds.','Water can boil and freeze at the same time at its triple point.',
 'Oxford University is older than the Aztec Empire.','Cleopatra lived closer in time to the Moon landing than to the building of the Great Pyramid.',
 'Your brain uses about 20% of your body’s energy.','Jupiter’s Great Red Spot is a storm wider than Earth.',
 'Hummingbirds can fly backward.','Antarctica is the largest desert on Earth.'];
// ---- Book of Mormon (239 chapters) ----------------------------------------------------
const bomBooks=[['1 Nephi',22],['2 Nephi',33],['Jacob',7],['Enos',1],['Jarom',1],['Omni',1],['Words of Mormon',1],['Mosiah',29],['Alma',63],['Helaman',16],['3 Nephi',30],['4 Nephi',1],['Mormon',9],['Ether',15],['Moroni',10]];
const bom=[]; bomBooks.forEach(([b,n])=>{for(let i=1;i<=n;i++)bom.push(n===1?b:b+' '+i)});
// ---- Tough Moment (tough-moment.md §1) ------------------------------------------------
// group: B body · M mind & spirit · R people · A get moving ; tipp = TIPP body action
const actions = {
 B1:{g:'B',a:'Cold water on your face · 30 sec',k:'DBT · TIPP: Temperature',go:'Start',tipp:1,timer:30},
 B2:{g:'B',a:'Breathe in 4, out 6, for 2 minutes',k:'DBT · TIPP: Paced breathing',go:'Start',tipp:1,timer:120},
 B3:{g:'B',a:'Tense, then release · 5 muscle groups',k:'DBT · TIPP: Paired muscle relaxation',go:'Start',tipp:1,timer:120},
 B4:{g:'B',a:'60 seconds of jumping jacks or fast stairs',k:'DBT · TIPP: Intense exercise',go:'Start',tipp:1,timer:60},
 B5:{g:'B',a:'Take a 10-minute walk outside',k:'Opposite action · Behavioral activation',go:'Start',timer:600},
 B6:{g:'B',a:'5-minute stretch (neck, shoulders, back)',k:'DBT · IMPROVE: Relaxing',go:'Start',timer:300},
 B7:{g:'B',a:'Water and a snack with some protein',k:'DBT · PLEASE · HALT',go:'Done'},
 M1:{g:'M',a:'STOP & go: stop, step back, one breath, then do one action',k:'DBT · STOP',go:'Open'},
 M2:{g:'M',a:'Name it: “I’m feeling ___, and it makes sense because ___.”',k:'Mindfulness · Describe',go:'Open'},
 M3:{g:'M',a:'Check the facts (6 quick questions)',k:'DBT · Check the facts',go:'Open'},
 M5:{g:'M',a:'“This is what’s happening. I can get through this moment.”',k:'DBT · Radical acceptance',go:'Open'},
 M7:{g:'M',a:'One thing: 5-minute timer for one small task',k:'DBT · IMPROVE: One thing',go:'Start',timer:300},
 S1:{g:'M',a:'Comfort kit: a warm drink and a soft blanket',k:'DBT · Self-soothe',go:'Done'},
 S2:{g:'M',a:'Play “Where Can I Turn for Peace?”',k:'DBT · IMPROVE: Prayer',go:'Play',url:'https://www.churchofjesuschrist.org/media/music/songs/where-can-i-turn-for-peace'},
 S3:{g:'M',a:'Pray for 2 minutes',k:'DBT · IMPROVE: Prayer',go:'Start',timer:120},
 S4:{g:'M',a:'Read Isaiah 41:10',k:'DBT · IMPROVE: Meaning',go:'Read',url:'https://www.churchofjesuschrist.org/study/scriptures/ot/isa/41?id=p10#p10'},
 S5:{g:'M',a:'“This is hard, and I’m doing something kind for myself.”',k:'Self-compassion',go:'Open'},
 R1:{g:'R',a:'Text your person: “Could use a hug 💛”',k:'DBT · Opposite action',go:'Text',sms:'Could use a hug 💛'},
 R2:{g:'R',a:'Call your person for 5 minutes',k:'DBT · Opposite action',go:'Call',tel:1},
 R3:{g:'R',a:'Go where people are, even if you don’t talk',k:'Opposite action',go:'Go'},
 R4:{g:'R',a:'Send one thank-you text',k:'DBT · ACCEPTS: Contributing',go:'Text',sms:'Thank you for '},
 R5:{g:'R',a:'Plan the hard talk with DEAR MAN',k:'DBT · Interpersonal effectiveness',go:'Open'},
 R6:{g:'R',a:'Take a 20-minute time-out before talking',k:'DBT · STOP + TIPP',go:'Start',timer:1200},
 A1:{g:'A',a:'One 2-minute tiny step',k:'Behavioral activation',go:'Start',timer:120},
 A2:{g:'A',a:'Stand in daylight for 5 minutes',k:'Behavioral activation',go:'Start',timer:300},
 A4:{g:'A',a:'Brain dump, circle ONE, do only that',k:'DBT · IMPROVE: One thing',go:'Open'},
 A5:{g:'A',a:'Write the worry down; shelve it until 7 pm tomorrow',k:'DBT · ACCEPTS: Pushing away',go:'Open'},
 A6:{g:'A',a:'10 minutes hands-on',k:'DBT · ACCEPTS: Activities',go:'Start',timer:600},
 A7:{g:'A',a:'Remember a time you got through something hard',k:'DBT · ACCEPTS: Comparisons',go:'Open'},
 A9:{g:'A',a:'Hold an ice cube or eat something sour',k:'DBT · ACCEPTS: Sensations',go:'Done'},
 SL1:{g:'B',a:'Awake ~20 min? Get up, dim light, read something boring',k:'Stimulus control · AASM',go:'Open'},
 SL2:{g:'M',a:'Write worries on the bedside pad',k:'DBT · ACCEPTS: Pushing away',go:'Open'},
 SL3:{g:'B',a:'Charge your phone outside the bedroom tonight',k:'Stimulus control',go:'Done'},
 G1:{g:'M',a:'One repair step, if there is one',k:'Guilt-focused repair',go:'Open'},
 CP:{g:'A',a:'Close the app, phone in another room, start something else',k:'Less comparison input',go:'Go'},
 TG:{g:'M',a:'Write 3 good things from today and why',k:'Three good things',go:'Open'},
};
const feelings = [
 {id:'angry',e:'😠',n:'Angry',c:'rgba(220,160,150,.09)',hi:1,steps:[['B1','Activates the dive reflex, which slows the heart fast.'],['B5','Burns off the energy and puts space between you and the trigger.'],['R6','Hard talks go better once your body has settled.'],['R2','Saying it out loud helps you name it.'],['M3','Does the anger match the facts? If so, plan a calm DEAR MAN.']]},
 {id:'anxious',e:'😰',n:'Anxious',c:'rgba(150,180,240,.09)',steps:[['B2','A longer out-breath calms your body.'],['A6','Piano, a puzzle, drawing, or a quick chore. Gives your mind a job.'],['M3','“What’s the most likely outcome?” Worry overestimates danger.'],['A5','Pushing away, on purpose and for a set time.'],['S2','Self-soothe through hearing, plus prayer.']]},
 {id:'sad',e:'😔',n:'Sad',c:'rgba(140,160,220,.09)',steps:[['A2','Small actions come first, and mood follows.'],['R1','Opposite action to withdrawing.'],['A1','Even a small win counts.'],['S1','Self-soothe.'],['S4','“Fear thou not; for I am with thee.”']]},
 {id:'lonely',e:'🫂',n:'Lonely',c:'rgba(170,160,235,.09)',steps:[['R2','Lonely says hide, so reach out instead. Just hear a voice.'],['R4','Doing one kind thing builds connection.'],['R3','Being around people still helps.'],['S3','You’re not alone in this.']]},
 {id:'hide',e:'🫥',n:'Wanting<br>to hide',c:'rgba(160,160,210,.09)',steps:[['R1','Hiding says pull away, so reach out a little.'],['R3','Small steps toward people are behavioral activation.'],['A2','A small action first; mood can follow.'],['M2','Naming without judging.'],['S3','You don’t have to carry this alone.']]},
 {id:'overwhelmed',e:'🌊',n:'Overwhelmed',c:'rgba(120,190,210,.09)',hi:1,steps:[['B2','Calm your body before you plan.'],['A4','One thing in the moment.'],['M7','Starting is the hardest part.'],['R1','Ask for help: “Can you take ___ tonight?”']]},
 {id:'stressed',e:'😩',n:'Stressed',c:'rgba(200,180,140,.09)',steps:[['B3','Paired muscle relaxation.'],['B5','Space and movement.'],['A4','Brain dump, then pick one.'],['B7','Stress hits harder when you’re running on empty.']]},
 {id:'ashamed',e:'😣',n:'Ashamed',c:'rgba(190,160,200,.09)',steps:[['S5','Self-compassion leads to more change, not less.'],['M3','“Did I do something, or am I telling myself I am something?”'],['G1','Guilt that leads to repair helps.'],['S4','The Savior knows this feeling (Alma 7:11-12).'],['R1','Tell one safe person, when you’re ready.']]},
 {id:'comparing',e:'🪞',n:'Comparing<br>myself',c:'rgba(170,190,220,.09)',steps:[['M3','“Am I comparing my everyday to their highlight reel?”'],['CP','Limiting social media lowered loneliness and depression.'],['S5','Self-compassion doesn’t depend on being better than anyone.'],['TG','Raised happiness for months in a study.'],['S4','“The Lord looketh on the heart” (1 Samuel 16:7).']]},
 {id:'numb',e:'😶',n:'Numb',c:'rgba(160,170,185,.09)',steps:[['A9','A strong sensation can cut through numbness.'],['B4','Wakes up your body.'],['A2','Behavioral activation.'],['M2','“I feel numb, and that makes sense after a lot.”']]},
 {id:'tired',e:'🌙',n:'Tired or<br>can’t sleep',c:'rgba(130,150,210,.10)',steps:[['B7','Tired often means running on empty.'],['B6','Gentle movement without revving you up.'],['SL1','Stimulus control (AASM).'],['B2','Breathe in 4, out 6, while lying down.'],['SL2','So your brain can let go of it.'],['SL3','Better sleep, and fewer late-night urges too.']]},
 {id:'frustrated',e:'😤',n:'Frustrated or<br>irritable',c:'rgba(210,170,140,.09)',hi:1,steps:[['B4','Burns off the charge.'],['B2','Slows the body down.'],['M3','Is it this thing, or everything piling up?'],['B7','Hungry and tired make everything more irritating.'],['B5','Space before you respond.']]},
 {id:'hopeless',e:'😮‍💨',n:'Hopeless',wide:1,pin988:1,c:'rgba(150,160,190,.09)',steps:[['R2','Hopelessness says “no one can help.” A voice pushes back.'],['S3','Tell Heavenly Father exactly how heavy it feels.'],['A2','A small action first, and mood can follow.'],['A7','Write one line about it.'],['S4','Ether 12:27: weakness can become strength.']]},
 {id:'givingup',e:'🏳️',n:'Feeling like giving up',wide:1,pin988:1,c:'rgba(170,175,200,.09)',steps:[['A1','When everything feels like too much, a very small action is enough.'],['R2','Hearing a voice pushes back on “what’s the point.”'],['A7','Remember a time you kept going.'],['S5','“I’m tired, not a failure of a person.”'],['S4','Ether 12:27: weakness can become strength.']]},
];
// ---- Tempted (tough-moment.md §3A) — each step: [action, why, tag, go]
const tempted = [
 {id:'porn',n:'🔞 Porn',groups:[['More for this one · pick one or two',[['Leave the room, go where people are','The phone stays behind. Removing the cue helps most.','Relapse prevention · Stimulus control','Go'],['Cold water on your face · 30 sec','Calms your body fast.','DBT · TIPP: Temperature','Start'],['Call or text your person','“Having a hard moment. Can you talk for 5 min?”','DBT · Opposite action','Text'],['HALT check','Hungry, Angry, Lonely, Tired? Care for that one first.','Relapse prevention · HALT','Check']]],
   ['Redirect',[['Do your planned alternative','Your own if-then plan, ready to go.','Implementation intentions','Open'],['Pray, or read 1 Corinthians 10:13','“…will with the temptation also make a way to escape.” Optional.','DBT · IMPROVE: Prayer','Open']]],
   ['For tonight',[['Phone charges outside the bedroom','Fewer late-night cues, better sleep.','Stimulus control · AASM','Remind']]]],plan:'If I feel the pull while scrolling, then I’ll stand up, close the app, and walk to another room.'},
 {id:'anger',n:'💥 Anger, lashing out, or breaking things',groups:[['Steps',[['STOP & go: step back and move','Active version of DBT STOP.','DBT · STOP','Go'],['Move away from people and breakables; 20-min time-out','“I want to finish this. Can we pick it up at 8:00?”','DBT STOP + stimulus control','Start'],['Cold water, or 60 sec of fast stairs','TIPP brings the body down first.','DBT · TIPP','Start'],['Skip smashing “to let it out”; do a walk, chore, or cooking instead','Venting while ruminating raised anger; doing nothing beat venting.','Bushman, 2002','Go'],['Later, when calm: plan the talk (DEAR MAN) + one repair step','Guilt that leads to repair helps.','DBT · Repair','Open']]]],plan:'If I feel my jaw tighten, then I’ll say “I need 20 minutes” and walk outside.',note:'If anyone is in danger right now, the 911 tile is at the bottom.'},
 {id:'binge',n:'🍩 Binge eating',groups:[['Steps',[['Get your hands busy away from the kitchen','Tidy one spot, text someone, or start a side quest.','Stimulus control','Go'],['Leave the kitchen; 15-minute brisk walk','A brief walk reduced cravings.','Taylor & Oliver, 2009','Start'],['Truly hungry? A planned snack on a plate, sitting down','Regular planned eating helps prevent binges.','CBT-E · Fairburn','Open'],['HALT / name the feeling','Bored, stressed, lonely, or tired often drives it, not hunger.','HALT · Affect labeling','Check'],['If it happened: one kind sentence, then your next normal meal','No “making up for it” by skipping meals.','Self-compassion','Open']]]],plan:'If I’m standing at the pantry bored, then I’ll go play one song on the piano.',anad:1},
 {id:'fastfood',n:'🍔 Fast food or impulse buys',groups:[['Steps',[['HALT: hungry? Eat from the Backup Shelf first','Grab-and-go backups from the Castle Kitchen cost far less.','HALT','Open'],['Keep moving: drive past or close the cart, call someone','Distance from the cue plus something else to do.','Stimulus control','Go'],['Budget check: “Is this in this week’s food budget?”','A gentle check from Fineous’s budget.','Planning','Check'],['If-then: driving home hungry → backup snack, drive past','If-then plans beat good intentions.','Implementation intentions','Open'],['Remove one-click ordering / saved cards in food apps','More friction, fewer automatic orders.','Stimulus control','Open']]]],plan:'If I’m driving home hungry, then I’ll eat my backup snack and drive past.'},
 {id:'doom',n:'📱 Doomscrolling',groups:[['Steps',[['Close the app, phone across the room, start something else','A replacement activity fills the gap.','Stimulus control','Go'],['Set a ~30 min daily cap in Screen Time','Limiting social media lowered loneliness and depression.','Hunt et al., 2018','Open'],['Move the apps off your home screen','Fewer cues, fewer automatic opens.','Stimulus control','Open'],['Planned alternative: text a friend, step outside, read 5 pages','Real connection beats the feed.','If-then plans','Go'],['Bored, lonely, or tired? Do the matching fix','A project, a person, or bed.','HALT','Check']]]],plan:'If I catch myself scrolling past 10 minutes, then I’ll put the phone on the charger and start a side quest.'},
 {id:'sucked',n:'🌀 Sucked in',groups:[['Steps',[['Decide your stopping point before you start','“2 episodes,” “1 chapter,” “until 9:30.”','Implementation intentions','Open'],['Set the timer before you start, with a 5-min heads-up','A pre-set cue does the stopping for you.','Gollwitzer, 1999','Start'],['Stop at a natural break','Episode end, chapter end, save point.','If-then plan','Open'],['Turn off autoplay and “next episode” countdowns','Autoplay makes “keep going” the default.','Defaults · Stimulus control','Open'],['When it’s time: stand, stretch, water, next planned thing','Changing position breaks the loop.','Implementation intentions','Go']]]],plan:'If the episode ends after 9:00, then I’ll stand up and start getting ready for bed.'},
 {id:'skip',n:'🚪 Skipping or quitting',groups:[['Steps',[['Do the 2-minute version: shoes on, one set, walk in','Action often comes before motivation.','Behavioral activation','Start'],['Name what’s in the way','If it’s real tiredness, rest is okay; plan the next time.','HALT','Check'],['Make the goal smaller instead of quitting','10 minutes, 1 page, half the workout.','Behavioral activation','Open'],['Text your person: “Can you nudge me at 5?”','A little accountability helps.','DBT · Contributing','Text'],['Already skipped? Just don’t miss twice','One miss doesn’t undo a habit.','Lally et al., 2010','Open']]]],plan:'If I don’t feel like the gym, then I’ll just put my shoes on and drive there.'},
 {id:'tomorrow',n:'⏳ I’ll do it tomorrow',groups:[['Steps',[['2-minute start, then you may stop','A tiny start lowers the dread.','Behavioral activation','Start'],['Shrink it to the very first step','“Open the doc and write the title.”','DBT · One thing','Open'],['If-then: “If it’s 7 pm, I sit at the desk with it open”','If-then plans help with put-off tasks.','Gollwitzer & Sheeran','Open'],['Bundle it with something you enjoy','A favorite playlist only while you work.','Milkman et al., 2014','Open'],['Put it off before? Forgive yourself, then start','Self-forgiveness cut later procrastination.','Wohl et al., 2010','Open']]]],plan:'If it’s 7 pm, then I’ll sit at the desk with the doc open for 2 minutes.'},
];
const dsn = {
 feel:[['bored','🥱 Bored',['move','switch']],['stressed','😩 Stressed',['move']],['lonely','🫂 Lonely',['connect']],['tired','😴 Tired',['leave']],['upset','😠 Upset',['move']],['unsure','🤷 Not sure',[]]],
 rows:[['move','🏃 Move','',[['10 pushups','Did 10 pushups'],['Walk outside','Took a walk'],['Cold water','Cold water reset']]],
       ['switch','🔀 Switch','',[['Side quest','Started a side quest'],['A hands-on task','Did a hands-on task']]],
       ['connect','💬 Connect','',[['Text your person','Texted a friend'],['Call someone','Called someone'],['Find your spouse','Spent time together']]],
       ['leave','🚪 Leave','change places',[['Go where people are','Changed places'],['Step outside','Stepped outside']]],
       ['hands','🙌 Hands busy','',[['Tidy one spot','Tidied one spot'],['Cook something','Cooked something'],['Piano / a game together','Played music or a game']]]]};
const crisis = [{n:'📞 💬 988',s:'Call or text<br>24/7',href:'tel:988',p:1},{n:'💬 Text HOME',s:'to 741741<br>24/7',href:'sms:741741&body=HOME'},{n:'🤝 Family<br>Services',s:'via your<br>bishop',href:'https://www.churchofjesuschrist.org/life/family-services'},{n:'🚨 911',s:'danger<br>right now',href:'tel:911'}];
// ---- Kitchen samples (Hanna's weekly plan fills the Sheet; these are SAMPLE until then) -------
const recipes = [{day:'Sat dinner · leftovers → Fri tacos',nm:'Sheet Pan Chicken Fajitas',src:'Budget Bytes',stars:'4.8 · 640 reviews',meta:['⏱ 15 min prep + 25 min cook','DASH · light salt','corn tortillas'],note:'Serves 4 · no pork, no fish',url:'https://www.budgetbytes.com/?s=sheet+pan+chicken+fajitas'},
  {day:'Sun prep · Mon–Fri bowls',nm:'Slow Cooker Shredded Chicken',src:'Allrecipes',stars:'4.7 · 1,900 ratings',meta:['⏱ 10 min prep + 6 hr low','DASH · no added salt','meal-prep ✓'],note:'Feeds the A & B bowls all week',url:'https://www.allrecipes.com/search?q=slow+cooker+shredded+chicken'}];
const shelf = [{e:'🥚',n:'Hard-boiled eggs',w:'fridge',s:'ok',l:'6 left'},{e:'🧀',n:'String cheese',w:'fridge',s:'low',l:'3 left · low'},{e:'🍚',n:'90-second rice pouches',w:'cupboard',s:'ok',l:'4 left'},{e:'🥦',n:'Frozen stir-fry veggies',w:'freezer',s:'low',l:'1 bag · low'},{e:'🍗',n:'Grilled chicken strips (zero-cook)',w:'freezer',s:'out',l:'out · on list'}];
const seedGrocery = [['Eggs, 18 ct','snow',2.47,'for boiled eggs & snack boxes'],['fairlife 2% milk, 52 oz','snow',4.78,''],['Brown rice 90-sec pouches ×4','carson',5.48,''],['Hummus, 10 oz','carson',3,'dip for carrots'],['Turkey pepperoni','snow',4.46,'Snow’s treat · no pork']];
const seedPrefs = [['love','both','Shredded chicken'],['love','both','Rice bowls'],['love','both','Corn-tortilla tacos'],['love','both','Boiled eggs'],['love','both','String cheese'],['love','both','Apples & bananas'],['love','snow','Turkey pepperoni'],['love','carson','Hummus & carrots'],['love','carson','Sparkling water'],
  ['no','both','Pork'],['no','both','Fish'],['no','both','White bread'],['no','both','White pasta'],['no','snow','Sweets (fruit only)'],['no','carson','Salty seasoning packets'],['no','carson','Club soda']];
const cheers = ['💛 Proud of you','🛡️ Thinking of you','🔥 You’ve got this'];
return {SCALE,familiars,stageOf,areas,fillDefaults,snowOnly,laundry,cleaning,deep,slots,decor,charms,gear,xpForLevel,levelForXp,facts,bom,actions,feelings,tempted,dsn,crisis,recipes,shelf,seedGrocery,seedPrefs,cheers};
})();
