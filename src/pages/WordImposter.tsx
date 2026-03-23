import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Play, Settings2, UserPlus, X, RotateCcw, ChevronRight, Clock, Zap, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addCustomQuestion, getCustomQuestions, removeCustomQuestion } from "@/lib/gameUtils";

type ImposterHint = "nothing" | "theme" | "similar";
type DiscussionOrder = "random" | "added";

const WORD_PACK_STORAGE_KEY = "word-imposter-words";

interface GameSettings {
  imposterCount: number;
  imposterHint: ImposterHint;
  discussionOrder: DiscussionOrder;
  timerEnabled: boolean;
  timerSeconds: number;
}

interface WordPack {
  word: string;
  theme: string;
  similar: string;
}

const defaultWordPacks: WordPack[] = [
  { word: "Durian", theme: "Food", similar: "Apple" },
  { word: "Grape", theme: "Food", similar: "Apple" },
  { word: "Apple", theme: "Food", similar: "Pineapple" },
  { word: "Tekong", theme: "Places in Singapore", similar: "Sentosa" },
  { word: "Guard Duty", theme: "NS Activities", similar: "Prowling" },
  { word: "SAR 21", theme: "Equipment", similar: "M16" },
  { word: "Route March", theme: "NS", similar: "Road Run" },
  { word: "Beret", theme: "Uniform", similar: "Jockey Cap" },
  { word: "Cookhouse", theme: "Camp Locations", similar: "Canteen" },
  { word: "IPPT", theme: "Fitness Tests", similar: "SOC" },
  { word: "Admin Time", theme: "NS", similar: "Stand By Bed" },
  { word: "Field Camp", theme: "Training", similar: "Outfield" },
  { word: "Milo", theme: "Drinks", similar: "Kopi" },
  { word: "Changi Airport", theme: "Singapore Places", similar: "Jewel" },
  { word: "MRT", theme: "Transport", similar: "Bus" },
  { word: "Char Kway Teow", theme: "Hawker Food", similar: "Hor Fun" },
  { word: "Encik", theme: "NS", similar: "Officer" },
  { word: "Push-up", theme: "Exercises", similar: "Plank" },
  { word: "Camo Cream", theme: "Field Equipment", similar: "Face Paint" },
  { word: "Topo Map", theme: "Navigation", similar: "Compass" },
  { word: "Lightning Alert", theme: "Events", similar: "Fire Drill" },
  { word: "Welfare Pack", theme: "NS", similar: "Ration Pack" },
  { word: "Basketball", theme: "Sports", similar: "Volleyball" },
  { word: "Orchard Road", theme: "Singapore Places", similar: "Bugis Street" },
  { word: "Laksa", theme: "Local Food", similar: "Mee Siam" },
  { word: "Book Out", theme: "NS Life", similar: "Book In" },
  { word: "Parachute", theme: "Military Equipment", similar: "Rappelling Rope" },
  { word: "Signal Flare", theme: "Field Equipment", similar: "Smoke Grenade" },
  { word: "Netflix", theme: "Entertainment", similar: "YouTube" },
  { word: "Bubble Tea", theme: "Drinks", similar: "Koi" },
  { word: "Singapore Flyer", theme: "Attractions", similar: "ArtScience Museum" },
  { word: "Chicken Rice", theme: "Food", similar: "Vegetable Rice" },
  { word: "Duck Rice", theme: "Food", similar: "Vegetable Rice" },
  { word: "Nasi Lemak", theme: "Food", similar: "Mee Goreng" },
  { word: "Hokkien Mee", theme: "Hawker Food", similar: "Fried Kway Teow" },
  { word: "Satay", theme: "Food", similar: "BBQ Skewers" },
  { word: "Roti Prata", theme: "Food", similar: "Thosai" },
  { word: "Teh Tarik", theme: "Drinks", similar: "Kopi Tarik" },
  { word: "Ice Milo", theme: "Drinks", similar: "Ice Coffee" },
  { word: "Kaya Toast", theme: "Food", similar: "Butter Toast" },
  { word: "Bak Kut Teh", theme: "Food", similar: "Herbal Soup" },
  { word: "Chendol", theme: "Dessert", similar: "Ice Kachang" },
  { word: "Durian", theme: "Food", similar: "Custard Apple" },
  { word: "Jackfruit", theme: "Food", similar: "Durian" },
  { word: "Chicken Rice", theme: "Food", similar: "Cai Fan" },
  { word: "Duck Rice", theme: "Food", similar: "Roast Meat" },
  { word: "Laksa", theme: "Food", similar: "Curry Noodles" },
  { word: "Mee Siam", theme: "Food", similar: "Curry Noodles" },
  { word: "Mee Rebus", theme: "Food", similar: "Curry Noodles" },
  { word: "Lontong", theme: "Food", similar: "Curry Noodles" },
  { word: "Roti Prata", theme: "Food", similar: "Chapati" },
  { word: "Thosai", theme: "Food", similar: "Roti Prata" },
  { word: "Satay", theme: "Food", similar: "Grilled Meat" },
  { word: "Popiah", theme: "Food", similar: "Spring Roll" },

  { word: "Sentosa", theme: "Singapore Places", similar: "Pulau Ubin" },
  { word: "Marina Bay Sands", theme: "Singapore Places", similar: "Resorts World Sentosa" },
  { word: "Gardens by the Bay", theme: "Singapore Places", similar: "Botanic Gardens" },
  { word: "Bugis Street", theme: "Singapore Places", similar: "Orchard Road" },
  { word: "Clarke Quay", theme: "Singapore Places", similar: "Boat Quay" },
  { word: "East Coast Park", theme: "Singapore Places", similar: "West Coast Park" },
  { word: "Jurong East", theme: "Singapore Places", similar: "Bukit Batok" },
  { word: "Woodlands", theme: "Singapore Places", similar: "Yishun" },
  { word: "Tampines", theme: "Singapore Places", similar: "Pasir Ris" },
  { word: "Toa Payoh", theme: "Singapore Places", similar: "Ang Mo Kio" },

  { word: "Section Commander", theme: "NS", similar: "Platoon Sergeant" },
  { word: "Lieutenant", theme: "NS", similar: "Captain" },
  { word: "Corporal", theme: "NS", similar: "Lance Corporal" },
  { word: "Recruit", theme: "NS", similar: "Trainee" },
  { word: "Platoon", theme: "NS", similar: "Section" },
  { word: "Company", theme: "NS", similar: "Battalion" },
  { word: "BMT", theme: "NS", similar: "Unit Life" },
  { word: "Outfield", theme: "NS", similar: "Field" },
  { word: "Forest", theme: "NS", similar: "Field" },
  { word: "SOC", theme: "NS", similar: "IPPT" },
  { word: "Range", theme: "NS", similar: "Live Firing" },

  { word: "Helmet", theme: "Equipment", similar: "Beret" },
  { word: "Field Pack", theme: "Equipment", similar: "Assault Bag" },
  { word: "Mess Tin", theme: "Field Equipment", similar: "Cooking Pot" },
  { word: "Water Bottle", theme: "Equipment", similar: "Camelbak" },
  { word: "Boots", theme: "Uniform", similar: "Shoes" },
  { word: "No.4", theme: "Uniform", similar: "Smart 4" },
  { word: "Name Tag", theme: "Uniform", similar: "Rank Patch" },
  { word: "Torchlight", theme: "Field Equipment", similar: "Flashlight" },
  { word: "Camouflage Net", theme: "Field Equipment", similar: "Tent Sheet" },
  { word: "Entrenching Tool", theme: "Field Equipment", similar: "Shovel" },

  { word: "Push-up Position", theme: "Exercises", similar: "Plank" },
  { word: "Crunches", theme: "Exercises", similar: "Sit-up" },
  { word: "Pull-up", theme: "Exercises", similar: "Chin-up" },
  { word: "Sprint", theme: "Exercises", similar: "Jog" },
  { word: "Jumping Jacks", theme: "Exercises", similar: "High Knees" },
  { word: "Burpees", theme: "Exercises", similar: "Squats" },
  { word: "Plank", theme: "Exercises", similar: "Wall Sit" },
  { word: "Lunges", theme: "Exercises", similar: "Squats" },
  { word: "Mountain Climbers", theme: "Exercises", similar: "Burpees" },
  { word: "Shuttle Run", theme: "Exercises", similar: "Sprint" },

  { word: "Stand By Bed", theme: "NS Life", similar: "Area Cleaning" },
  { word: "Area Cleaning", theme: "NS Life", similar: "Stand By Bed" },
  { word: "Lights Out", theme: "NS Life", similar: "Last Parade" },
  { word: "First Parade", theme: "NS Life", similar: "Last Parade" },
  { word: "Fall In", theme: "NS Activities", similar: "Fall Out" },
  { word: "Marching", theme: "NS Activities", similar: "Drill" },
  { word: "Drill", theme: "NS Activities", similar: "Marching" },
  { word: "Guard Mounting", theme: "NS Activities", similar: "Guard Duty" },
  { word: "Sentry", theme: "NS Activities", similar: "Guard Duty" },
  { word: "Prowling", theme: "NS Activities", similar: "Guard Duty" },

  { word: "WhatsApp", theme: "Mobile Apps", similar: "Telegram" },
  { word: "Instagram", theme: "Mobile Apps", similar: "TikTok" },
  { word: "TikTok", theme: "Mobile Apps", similar: "Instagram" },
  { word: "YouTube", theme: "Entertainment", similar: "Netflix" },
  { word: "Spotify", theme: "Mobile Apps", similar: "Apple Music" },
  { word: "Telegram", theme: "Mobile Apps", similar: "WhatsApp" },
  { word: "Discord", theme: "Mobile Apps", similar: "Teams" },
  { word: "Twitter", theme: "Mobile Apps", similar: "Threads" },
  { word: "Threads", theme: "Mobile Apps", similar: "Twitter" },
  { word: "Reddit", theme: "Mobile Apps", similar: "Forum" },

  { word: "Taxi", theme: "Transport", similar: "Grab" },
  { word: "Grab", theme: "Transport", similar: "Taxi" },
  { word: "LRT", theme: "Transport", similar: "MRT" },
  { word: "Bus Stop", theme: "Transport", similar: "MRT Station" },
  { word: "EZ-Link", theme: "Transport", similar: "NETS FlashPay" },
  { word: "Car", theme: "Transport", similar: "Taxi" },
  { word: "Motorbike", theme: "Transport", similar: "Bicycle" },
  { word: "Bicycle", theme: "Transport", similar: "Motorbike" },
  { word: "Van", theme: "Transport", similar: "Truck" },
  { word: "Truck", theme: "Transport", similar: "Van" },

  { word: "Laptop", theme: "Electronics", similar: "Computer" },
  { word: "Phone", theme: "Electronics", similar: "Tablet" },
  { word: "Tablet", theme: "Electronics", similar: "Phone" },
  { word: "Power Bank", theme: "Electronics", similar: "Charger" },
  { word: "Charger", theme: "Electronics", similar: "Cable" },
  { word: "Headphones", theme: "Electronics", similar: "Earbuds" },
  { word: "Earbuds", theme: "Electronics", similar: "Headphones" },
  { word: "Keyboard", theme: "Electronics", similar: "Mouse" },
  { word: "Mouse", theme: "Electronics", similar: "Keyboard" },
  { word: "Monitor", theme: "Electronics", similar: "Screen" },

  { word: "Football", theme: "Sports", similar: "Rugby" },
  { word: "Badminton", theme: "Sports", similar: "Tennis" },
  { word: "Tennis", theme: "Sports", similar: "Badminton" },
  { word: "Table Tennis", theme: "Sports", similar: "Ping Pong" },
  { word: "Swimming", theme: "Sports", similar: "Diving" },
  { word: "Cycling", theme: "Sports", similar: "Running" },
  { word: "Running", theme: "Sports", similar: "Jogging" },
  { word: "Gym", theme: "Sports", similar: "Workout" },
  { word: "Workout", theme: "Sports", similar: "Gym" },
  { word: "Boxing", theme: "Sports", similar: "MMA" },

  { word: "Pizza", theme: "Food", similar: "Burger" },
  { word: "Burger", theme: "Food", similar: "Sandwich" },
  { word: "Fries", theme: "Food", similar: "Wedges" },
  { word: "Hotdog", theme: "Food", similar: "Sausage" },
  { word: "Sandwich", theme: "Food", similar: "Burger" },
  { word: "Pasta", theme: "Food", similar: "Spaghetti" },
  { word: "Spaghetti", theme: "Food", similar: "Pasta" },
  { word: "Steak", theme: "Food", similar: "Chicken Chop" },
  { word: "Ice Cream", theme: "Dessert", similar: "Gelato" },
  { word: "Chocolate", theme: "Dessert", similar: "Candy" },
  { word: "Milo", theme: "Drinks", similar: "Chocolate Drink" },
  { word: "Kopi", theme: "Drinks", similar: "Espresso" },
  { word: "Teh Tarik", theme: "Drinks", similar: "Milk Tea" },
  { word: "Bandung", theme: "Drinks", similar: "Rose Milk" },
  { word: "Bubble Tea", theme: "Drinks", similar: "Milkshake" },
  { word: "Sugarcane", theme: "Drinks", similar: "Fresh Juice" },

  { word: "Rain", theme: "Weather", similar: "Storm" },
  { word: "Storm", theme: "Weather", similar: "Rain" },
  { word: "Sun", theme: "Weather", similar: "Heat" },
  { word: "Cloud", theme: "Weather", similar: "Sky" },
  { word: "Wind", theme: "Weather", similar: "Breeze" },
  { word: "Thunder", theme: "Weather", similar: "Lightning" },
  { word: "Lightning", theme: "Weather", similar: "Thunder" },
  { word: "Fog", theme: "Weather", similar: "Mist" },
  { word: "Mist", theme: "Weather", similar: "Fog" },
  { word: "Rainbow", theme: "Weather", similar: "Sun" },

  { word: "Teacher", theme: "People", similar: "Instructor" },
  { word: "Doctor", theme: "People", similar: "Nurse" },
  { word: "Nurse", theme: "People", similar: "Doctor" },
  { word: "Driver", theme: "People", similar: "Pilot" },
  { word: "Pilot", theme: "People", similar: "Driver" },
  { word: "Chef", theme: "People", similar: "Cook" },
  { word: "Cook", theme: "People", similar: "Chef" },
  { word: "Police", theme: "People", similar: "Security" },
  { word: "Security", theme: "People", similar: "Police" },
  { word: "Firefighter", theme: "People", similar: "Rescuer" },

  { word: "Chair", theme: "Objects", similar: "Couch" },
  { word: "Table", theme: "Objects", similar: "Desk" },
  { word: "Desk", theme: "Objects", similar: "Chair" },
  { word: "Bed", theme: "Objects", similar: "Mattress" },
  { word: "Pillow", theme: "Objects", similar: "Cushion" },
  { word: "Blanket", theme: "Objects", similar: "Quilt" },
  { word: "Fan", theme: "Objects", similar: "Aircon" },
  { word: "Aircon", theme: "Objects", similar: "Fan" },
  { word: "Light", theme: "Objects", similar: "Lamp" },
  { word: "Lamp", theme: "Objects", similar: "Light" },
  { word: "Netflix", theme: "Entertainment", similar: "Streaming" },
  { word: "YouTube", theme: "Entertainment", similar: "Video Platform" },
  { word: "Spotify", theme: "Entertainment", similar: "YouTube" },
  { word: "Instagram", theme: "Entertainment", similar: "Photo Sharing" },
  { word: "TikTok", theme: "Entertainment", similar: "Short" },
  { word: "WhatsApp", theme: "Entertainment", similar: "Messaging App" },

  // Generic animals
  { word: "Dog", theme: "Animals", similar: "Pet Animal" },
  { word: "Cat", theme: "Animals", similar: "House Pet" },
  { word: "Lion", theme: "Animals", similar: "Big Cat" },
  { word: "Tiger", theme: "Animals", similar: "Striped Animal" },
  { word: "Elephant", theme: "Animals", similar: "Large Mammal" },

  // Objects
  { word: "Chair", theme: "Objects", similar: "Seating" },
  { word: "Table", theme: "Objects", similar: "Furniture" },
  { word: "Bed", theme: "Objects", similar: "Sleeping Area" },
  { word: "Pillow", theme: "Objects", similar: "Head Support" },

  // Emotions
  { word: "Happy", theme: "Emotions", similar: "Joyful Feeling" },
  { word: "Sad", theme: "Emotions", similar: "Unhappy" },
  { word: "Angry", theme: "Emotions", similar: "Mad Feeling" },
  { word: "Excited", theme: "Emotions", similar: "High Energy" },

  // Weather
  { word: "Rain", theme: "Weather", similar: "Wet Weather" },
  { word: "Storm", theme: "Weather", similar: "Heavy Rain" },
  { word: "Sun", theme: "Weather", similar: "Sunny Weather" },
  { word: "Lightning", theme: "Weather", similar: "Electric Flash" },

  { word: "Zombie", theme: "Fiction", similar: "Vampire" },
  { word: "Vampire", theme: "Fiction", similar: "Zombie" },
  { word: "Ghost", theme: "Fiction", similar: "Spirit" },
  { word: "Alien", theme: "Fiction", similar: "UFO" },
  { word: "Robot", theme: "Fiction", similar: "AI" },
  { word: "AI", theme: "Fiction", similar: "Robot" },
  { word: "Superhero", theme: "Fiction", similar: "Hero" },
  { word: "Villain", theme: "Fiction", similar: "Enemy" },
  { word: "Wizard", theme: "Fiction", similar: "Magician" },
  { word: "Dragon", theme: "Fiction", similar: "Monster" },
  { word: "Apple", theme: "Food", similar: "Orange" },
  { word: "Orange", theme: "Food", similar: "Apple" },
  { word: "Banana", theme: "Food", similar: "Fruit" },
  { word: "Strawberry", theme: "Food", similar: "Berry" },
  { word: "Watermelon", theme: "Food", similar: "Melon" },

  { word: "Dog", theme: "Animals", similar: "Cat" },
  { word: "Cat", theme: "Animals", similar: "Dog" },
  { word: "Lion", theme: "Animals", similar: "Tiger" },
  { word: "Tiger", theme: "Animals", similar: "Lion" },
  { word: "Elephant", theme: "Animals", similar: "Rhino" },

  { word: "Car", theme: "Transport", similar: "Truck" },
  { word: "Plane", theme: "Transport", similar: "Jet" },
  { word: "Ship", theme: "Transport", similar: "Boat" },
  { word: "Train", theme: "Transport", similar: "Metro" },
  { word: "Bike", theme: "Transport", similar: "Bicycle" },

  { word: "Laptop", theme: "Electronics", similar: "Computer" },
  { word: "Phone", theme: "Electronics", similar: "Smartphone" },
  { word: "TV", theme: "Electronics", similar: "Monitor" },
  { word: "Camera", theme: "Electronics", similar: "Phone Camera" },
  { word: "Speaker", theme: "Electronics", similar: "Headphones" },

  { word: "Teacher", theme: "People", similar: "Student" },
  { word: "Student", theme: "People", similar: "Teacher" },
  { word: "Doctor", theme: "People", similar: "Surgeon" },
  { word: "Engineer", theme: "People", similar: "Programmer" },
  { word: "Artist", theme: "People", similar: "Painter" },

  { word: "Football", theme: "Sports", similar: "Soccer" },
  { word: "Basketball", theme: "Sports", similar: "Volleyball" },
  { word: "Tennis", theme: "Sports", similar: "Badminton" },
  { word: "Golf", theme: "Sports", similar: "Mini Golf" },
  { word: "Swimming", theme: "Sports", similar: "Diving" },

  { word: "Pizza", theme: "Food", similar: "Pasta" },
  { word: "Burger", theme: "Food", similar: "Sandwich" },
  { word: "Fries", theme: "Food", similar: "Chips" },
  { word: "Ice Cream", theme: "Dessert", similar: "Gelato" },
  { word: "Cake", theme: "Dessert", similar: "Cupcake" },

  { word: "Sun", theme: "Nature", similar: "Star" },
  { word: "Moon", theme: "Nature", similar: "Satellite" },
  { word: "Ocean", theme: "Nature", similar: "Sea" },
  { word: "Mountain", theme: "Nature", similar: "Hill" },
  { word: "Forest", theme: "Nature", similar: "Jungle" },

  { word: "Chair", theme: "Objects", similar: "Seat" },
  { word: "Table", theme: "Objects", similar: "Desk" },
  { word: "Bed", theme: "Objects", similar: "Mattress" },
  { word: "Door", theme: "Objects", similar: "Gate" },
  { word: "Window", theme: "Objects", similar: "Glass" },

  { word: "Happy", theme: "Emotions", similar: "Joyful" },
  { word: "Sad", theme: "Emotions", similar: "Upset" },
  { word: "Angry", theme: "Emotions", similar: "Mad" },
  { word: "Excited", theme: "Emotions", similar: "Thrilled" },
  { word: "Scared", theme: "Emotions", similar: "Afraid" },
];

const WordImposter = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"setup" | "settings" | "reveal" | "discussion" | "voting" | "vote-out" | "result" | "game-over">("setup");
  const [players, setPlayers] = useState<string[]>([]);
  const [newPlayer, setNewPlayer] = useState("");
  const [settings, setSettings] = useState<GameSettings>({ imposterCount: 1, imposterHint: "nothing", discussionOrder: "random", timerEnabled: false, timerSeconds: 120 });
  const [timeLeft, setTimeLeft] = useState(120);
  const [newWord, setNewWord] = useState("");
  const [newTheme, setNewTheme] = useState("");
  const [newSimilarWord, setNewSimilarWord] = useState("");
  const [showAddWords, setShowAddWords] = useState(false);
  const [wordPackMode, setWordPackMode] = useState<"mixed" | "default-only" | "custom-only">("mixed");
  
  // Game state
  const [assignments, setAssignments] = useState<{ name: string; isImposter: boolean; text: string }[]>([]);
  const [revealIndex, setRevealIndex] = useState(0);
  const [cardRevealed, setCardRevealed] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [currentWord, setCurrentWord] = useState<WordPack | null>(null);
  const [customWordPacks, setCustomWordPacks] = useState<WordPack[]>([]);
  const [allWordPacks, setAllWordPacks] = useState<WordPack[]>(defaultWordPacks);
  const [discussionQueue, setDiscussionQueue] = useState<string[]>([]);
  const currentGameDiscussionSeedRef = useRef(0);
  const nextGameDiscussionSeedRef = useRef(0);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [votingRound, setVotingRound] = useState(1);
  const [selectedVoteOut, setSelectedVoteOut] = useState<string | null>(null);
  const [eliminatedPlayers, setEliminatedPlayers] = useState<string[]>([]);
  const [revealedWords, setRevealedWords] = useState(false);

  const refreshWordPacks = useCallback(() => {
    const custom = getCustomQuestions(WORD_PACK_STORAGE_KEY)
      .map((q) => {
        const [word, theme, similar] = q.split("|").map((v) => v.trim());
        if (!word || !theme || !similar) return null;
        return { word, theme, similar } as WordPack;
      })
      .filter(Boolean) as WordPack[];

    setCustomWordPacks(custom);
    setAllWordPacks([...defaultWordPacks, ...custom]);
  }, []);

  useEffect(() => {
    refreshWordPacks();
  }, [refreshWordPacks]);

  useEffect(() => {
    if (!settings.timerEnabled || phase !== "discussion") return;
    
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setPhase("voting");
          setVotes({});
          return settings.timerSeconds;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [settings.timerEnabled, phase, settings.timerSeconds]);

  const addPlayer = useCallback(() => {
    const name = newPlayer.trim();
    if (name && !players.includes(name)) {
      setPlayers((p) => [...p, name]);
      setNewPlayer("");
    }
  }, [newPlayer, players]);

  const removePlayer = useCallback((name: string) => {
    setPlayers((p) => p.filter((n) => n !== name));
  }, []);

  const maxImposters = Math.max(1, Math.floor(players.length / 2) - 1);
  const validImposterCount = Math.min(settings.imposterCount, maxImposters);
  const maxVotingRounds = Math.max(
    validImposterCount + 1,
    Math.min(players.length - 1, Math.max(2, Math.ceil(players.length / 2)))
  );

  const buildDiscussionQueue = useCallback((seed: number, eliminatedSnapshot?: string[]) => {
    const eliminated = eliminatedSnapshot ?? eliminatedPlayers;
    const activePlayers = players.filter((p) => !eliminated.includes(p));
    if (settings.discussionOrder === "added") {
      if (activePlayers.length === 0) return [];
      const offset = seed % activePlayers.length;
      return [...activePlayers.slice(offset), ...activePlayers.slice(0, offset)];
    }
    return [...activePlayers].sort(() => Math.random() - 0.5);
  }, [players, eliminatedPlayers, settings.discussionOrder]);

  const enterDiscussionPhase = useCallback((eliminatedSnapshot?: string[]) => {
    setDiscussionQueue(buildDiscussionQueue(currentGameDiscussionSeedRef.current, eliminatedSnapshot));
    setTimeLeft(settings.timerSeconds);
    setPhase("discussion");
    setAnimKey((k) => k + 1);
  }, [buildDiscussionQueue, settings.timerSeconds]);

  const addWordPackHandler = useCallback(() => {
    const word = newWord.trim();
    const theme = newTheme.trim();
    const similar = newSimilarWord.trim();
    if (!word || !theme || !similar) return;

    addCustomQuestion(WORD_PACK_STORAGE_KEY, `${word} | ${theme} | ${similar}`);
    setNewWord("");
    setNewTheme("");
    setNewSimilarWord("");
    refreshWordPacks();
  }, [newWord, newTheme, newSimilarWord, refreshWordPacks]);

  const removeWordPackHandler = useCallback((pack: WordPack) => {
    removeCustomQuestion(WORD_PACK_STORAGE_KEY, `${pack.word} | ${pack.theme} | ${pack.similar}`);
    refreshWordPacks();
  }, [refreshWordPacks]);

  const startGame = useCallback(() => {
    const sourcePacks =
      wordPackMode === "custom-only"
        ? customWordPacks
        : wordPackMode === "default-only"
          ? defaultWordPacks
          : (allWordPacks.length > 0 ? allWordPacks : defaultWordPacks);
    if (sourcePacks.length === 0) return;
    const wordData = sourcePacks[Math.floor(Math.random() * sourcePacks.length)];
    setCurrentWord(wordData);

    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    const imposters = new Set(shuffledPlayers.slice(0, validImposterCount));

    const getImposterText = () => {
      switch (settings.imposterHint) {
        case "nothing": return "You are the IMPOSTER!\nYou got nothing. Good luck. 😈";
        case "theme": return `You are the IMPOSTER!\nTheme: ${wordData.theme}`;
        case "similar": return `You are the IMPOSTER!\nYour word: ${wordData.similar}`;
      }
    };

    const assigned = players.map((name) => ({
      name,
      isImposter: imposters.has(name),
      text: imposters.has(name) ? getImposterText() : `Your word:\n${wordData.word}`,
    }));

    setAssignments(assigned);
    setRevealIndex(0);
    setCardRevealed(false);
    setVotes({});
    setVotingRound(1);
    setSelectedVoteOut(null);
    setEliminatedPlayers([]);
    setDiscussionQueue([]);
    if (settings.discussionOrder === "added") {
      currentGameDiscussionSeedRef.current = nextGameDiscussionSeedRef.current;
      nextGameDiscussionSeedRef.current += 1;
    } else {
      currentGameDiscussionSeedRef.current = 0;
    }
    setRevealedWords(false);
    setPhase("reveal");
    setAnimKey((k) => k + 1);
    setTimeLeft(settings.timerSeconds);
  }, [players, validImposterCount, settings, allWordPacks, wordPackMode, customWordPacks]);

  const nextPlayer = useCallback(() => {
    if (revealIndex < assignments.length - 1) {
      setRevealIndex((i) => i + 1);
      setCardRevealed(false);
      setAnimKey((k) => k + 1);
    } else {
      enterDiscussionPhase();
    }
  }, [revealIndex, assignments.length, enterDiscussionPhase]);

  const resetGame = useCallback(() => {
    setPhase("setup");
    setAssignments([]);
    setRevealIndex(0);
    setCardRevealed(false);
    setVotes({});
    setVotingRound(1);
    setSelectedVoteOut(null);
    setEliminatedPlayers([]);
    setDiscussionQueue([]);
    currentGameDiscussionSeedRef.current = 0;
    setRevealedWords(false);
  }, []);

  const handleVote = useCallback((playerName: string) => {
    setVotes((v) => ({
      ...v,
      [playerName]: (v[playerName] || 0) + 1,
    }));
  }, []);

  const findMostVoted = useCallback(() => {
    if (Object.keys(votes).length === 0) return null;
    let maxVotes = 0;
    let mostVoted = "";
    for (const [name, count] of Object.entries(votes)) {
      if (count > maxVotes) {
        maxVotes = count;
        mostVoted = name;
      }
    }
    return mostVoted;
  }, [votes]);

  const handleVoteOut = useCallback((playerName: string) => {
    setSelectedVoteOut(playerName);
    setPhase("vote-out");
  }, []);

  const confirmVoteOut = useCallback(() => {
    if (!selectedVoteOut) return;

    const votedOutPlayer = assignments.find((a) => a.name === selectedVoteOut);
    const nextEliminated = eliminatedPlayers.includes(selectedVoteOut)
      ? eliminatedPlayers
      : [...eliminatedPlayers, selectedVoteOut];

    setEliminatedPlayers(nextEliminated);

    const remainingImposters = assignments.filter(
      (a) => a.isImposter && !nextEliminated.includes(a.name)
    ).length;

    if (remainingImposters === 0) {
      setPhase("result");
      return;
    }

    if (votingRound >= maxVotingRounds) {
      setRevealedWords(false);
      setPhase("game-over");
      return;
    }

    setVotingRound((r) => r + 1);
    setVotes({});
    setSelectedVoteOut(null);
    setTimeLeft(settings.timerSeconds);

    if (settings.timerEnabled) {
      enterDiscussionPhase(nextEliminated);
    } else {
      setPhase("voting");
    }
  }, [selectedVoteOut, assignments, eliminatedPlayers, votingRound, maxVotingRounds, settings.timerEnabled, settings.timerSeconds, enterDiscussionPhase]);

  // Setup phase
  if (phase === "setup" || phase === "settings") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-6 pb-4">
          <button onClick={() => navigate("/")} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl font-bold">Word Imposter</h1>
        </div>

        <div className="flex-1 px-6 pb-12 max-w-sm mx-auto w-full" style={{ animation: "slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
          {phase === "setup" ? (
            <>
              <div className="text-center mb-8 mt-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mx-auto mb-4">
                  <EyeOff className="w-8 h-8" />
                </div>
                <h2 className="font-display text-2xl font-bold mb-2">Add Players</h2>
                <p className="text-muted-foreground text-sm">Everyone gets the same word — except the imposter.</p>
              </div>

              <div className="flex gap-2 mb-4">
                <input
                  value={newPlayer}
                  onChange={(e) => setNewPlayer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addPlayer()}
                  placeholder="Enter name..."
                  className="flex-1 bg-secondary rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <Button onClick={addPlayer} size="icon" className="bg-primary/15 text-primary hover:bg-primary/25 rounded-xl h-[46px] w-[46px]">
                  <UserPlus className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-2 mb-6">
                {players.map((p) => (
                  <div key={p} className="flex items-center justify-between bg-card rounded-xl px-4 py-3 border border-border" style={{ animation: "slide-up-fade 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
                    <span className="font-medium text-sm">{p}</span>
                    <button onClick={() => removePlayer(p)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {players.length >= 3 && (
                <div className="space-y-3">
                  <Button size="lg" variant="outline" onClick={() => setPhase("settings")} className="w-full">
                    <Settings2 className="w-4 h-4" /> Customize Settings
                  </Button>
                  <Button size="xl" onClick={startGame} className="w-full bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20">
                    <Play className="w-5 h-5" /> Start Game ({players.length} players)
                  </Button>
                </div>
              )}
              {players.length < 3 && players.length > 0 && (
                <p className="text-center text-muted-foreground text-xs font-mono">Need at least 3 players</p>
              )}
            </>
          ) : (
            /* Settings phase */
            <>
              <div className="text-center mb-8 mt-6">
                <h2 className="font-display text-2xl font-bold mb-2">Game Settings</h2>
                <p className="text-muted-foreground text-sm">Customize the difficulty</p>
              </div>

              {/* Imposter count */}
              <div className="bg-card rounded-2xl border border-border p-5 mb-4">
                <label className="text-xs font-mono text-muted-foreground mb-3 block">NUMBER OF IMPOSTERS</label>
                <div className="flex gap-2">
                  {Array.from({ length: maxImposters }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setSettings((s) => ({ ...s, imposterCount: n }))}
                      className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all active:scale-95 ${
                        settings.imposterCount === n
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Imposter hint */}
              <div className="bg-card rounded-2xl border border-border p-5 mb-8">
                <label className="text-xs font-mono text-muted-foreground mb-3 block">WHAT DOES THE IMPOSTER GET?</label>
                <div className="space-y-2">
                  {([
                    { value: "nothing" as ImposterHint, label: "Nothing", desc: "Hardest — imposter has zero clues" },
                    { value: "theme" as ImposterHint, label: "Theme / Category", desc: "Medium — imposter knows the category" },
                    { value: "similar" as ImposterHint, label: "Similar Word", desc: "Easiest — imposter gets a related word" },
                  ]).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSettings((s) => ({ ...s, imposterHint: opt.value }))}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all active:scale-[0.97] ${
                        settings.imposterHint === opt.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <span className="font-semibold text-sm block">{opt.label}</span>
                      <span className="text-xs text-muted-foreground">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Timer Setting */}
              <div className="bg-card rounded-2xl border border-border p-5 mb-8">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.timerEnabled}
                    onChange={(e) => setSettings((s) => ({ ...s, timerEnabled: e.target.checked }))}
                    className="w-4 h-4 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Enable Discussion Timer
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Auto-end discussion after timer</p>
                  </div>
                </label>
                {settings.timerEnabled && (
                  <div className="mt-4">
                    <label className="text-xs font-medium text-muted-foreground">Duration (seconds)</label>
                    <input
                      type="number"
                      min="30"
                      max="600"
                      value={settings.timerSeconds}
                      onChange={(e) => setSettings((s) => ({ ...s, timerSeconds: parseInt(e.target.value) || 120 }))}
                      className="w-full mt-2 bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                )}
              </div>

              <div className="bg-card rounded-2xl border border-border p-5 mb-8">
                <label className="text-xs font-mono text-muted-foreground mb-3 block">DISCUSSION ORDER</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSettings((s) => ({ ...s, discussionOrder: "random" }))}
                    className={`py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                      settings.discussionOrder === "random"
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    Random First
                  </button>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, discussionOrder: "added" }))}
                    className={`py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                      settings.discussionOrder === "added"
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    Add Order
                  </button>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-5 mb-8">
                <div className="mb-4">
                  <label className="text-xs font-medium text-muted-foreground">Word Pack Source</label>
                  <select
                    value={wordPackMode}
                    onChange={(e) => setWordPackMode(e.target.value as "mixed" | "default-only" | "custom-only")}
                    className="w-full mt-2 bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="mixed">Use ALL Data</option>
                    <option value="default-only">BUILT-IN Data</option>
                    <option value="custom-only">CUSTOM Data</option>
                  </select>
                </div>

                <button
                  onClick={() => setShowAddWords((v) => !v)}
                  className="w-full flex items-center justify-between text-sm font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Custom Word Packs
                  </span>
                  <span className="text-xs text-muted-foreground">{customWordPacks.length}</span>
                </button>

                {showAddWords && (
                  <div className="mt-4 space-y-3">
                    <input
                      value={newWord}
                      onChange={(e) => setNewWord(e.target.value)}
                      placeholder="Main word (e.g. Durian)"
                      className="w-full bg-secondary rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <input
                      value={newTheme}
                      onChange={(e) => setNewTheme(e.target.value)}
                      placeholder="Theme (e.g. Food)"
                      className="w-full bg-secondary rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <input
                      value={newSimilarWord}
                      onChange={(e) => setNewSimilarWord(e.target.value)}
                      placeholder="Imposter clue word (e.g. Jackfruit)"
                      className="w-full bg-secondary rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <Button size="sm" onClick={addWordPackHandler} className="w-full bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20">
                      <Plus className="w-4 h-4" /> Add Word Pack
                    </Button>

                    {customWordPacks.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {customWordPacks.map((pack) => (
                          <div key={`${pack.word}|${pack.theme}|${pack.similar}`} className="bg-secondary rounded-lg p-3 text-xs flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <p><span className="font-semibold">Word:</span> {pack.word}</p>
                              <p><span className="font-semibold">Theme:</span> {pack.theme}</p>
                              <p><span className="font-semibold">Imposter clue:</span> {pack.similar}</p>
                            </div>
                            <button
                              onClick={() => removeWordPackHandler(pack)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Button size="lg" variant="outline" onClick={() => setPhase("setup")} className="w-full">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                  size="xl"
                  onClick={startGame}
                  disabled={wordPackMode === "custom-only" && customWordPacks.length === 0}
                  className="w-full bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20"
                >
                  <Play className="w-5 h-5" /> Start Game
                </Button>
                {wordPackMode === "custom-only" && customWordPacks.length === 0 && (
                  <p className="text-center text-muted-foreground text-xs font-mono">No custom word packs available.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Reveal phase — pass phone around
  if (phase === "reveal") {
    const current = assignments[revealIndex];
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-6 pb-4">
          <button onClick={resetGame} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl font-bold">Word Imposter</h1>
          <span className="ml-auto text-xs text-muted-foreground font-mono">{revealIndex + 1}/{assignments.length}</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12" key={animKey}>
          <div className="text-center max-w-sm w-full" style={{ animation: "slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-base font-bold mb-6 bg-primary/15 text-primary">
              {current.name}
            </div>

            {!cardRevealed ? (
              <>
                <p className="text-muted-foreground text-sm mb-8">
                  Pass the phone to <span className="text-foreground font-semibold">{current.name}</span>.<br />
                  Only they should see the screen.
                </p>
                <Button size="xl" onClick={() => setCardRevealed(true)} className="bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20">
                  <Eye className="w-5 h-5" /> Reveal My Card
                </Button>
              </>
            ) : (
              <>
                <div className={`rounded-2xl border-2 p-8 mb-8 ${
                  current.isImposter
                    ? "border-destructive/40 bg-destructive/5"
                    : "border-primary/30 bg-primary/5"
                }`}>
                  {current.text.split("\n").map((line, i) => (
                    <p key={i} className={`${i === 0 ? "font-display text-2xl font-bold mb-2" : "text-lg font-semibold"} ${
                      current.isImposter ? "text-destructive" : "text-primary"
                    }`}>
                      {line}
                    </p>
                  ))}
                </div>
                <Button size="xl" onClick={nextPlayer} className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
                  <ChevronRight className="w-5 h-5" />
                  {revealIndex < assignments.length - 1 ? "Next Player" : "Start Discussion"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Discussion phase
  if (phase === "discussion") {
    const queue = discussionQueue.length > 0 ? discussionQueue : buildDiscussionQueue(currentGameDiscussionSeedRef.current);

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-6 pb-4">
          <button onClick={resetGame} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl font-bold">Word Imposter</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12" key={animKey}>
          <div className="text-center max-w-sm" style={{ animation: "slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
            <div className="w-16 h-16 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mx-auto mb-6">
              <EyeOff className="w-8 h-8" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">Time to Discuss!</h2>
            <p className="text-muted-foreground text-sm mb-3 max-w-xs mx-auto">
              Everyone describes the word without saying it directly. Find the imposter!
            </p>
            <p className="text-xs text-muted-foreground font-mono mb-4">
              {validImposterCount} imposter{validImposterCount > 1 ? "s" : ""} among {players.length} players
            </p>

            {queue.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-4 mb-6 text-left">
                <p className="text-xs font-mono text-muted-foreground mb-2">DISCUSSION ORDER</p>
                <p className="text-sm mb-1"><span className="font-semibold">First:</span> {queue[0]}</p>
                <p className="text-xs text-muted-foreground">{queue.join(" -> ")}</p>
              </div>
            )}

            {settings.timerEnabled && (
              <div className="font-display text-4xl font-bold text-primary mb-8">
                {timeLeft}s
              </div>
            )}

            <div className="space-y-3">
              <Button size="xl" onClick={() => { setPhase("voting"); setVotes({}); }} className="w-full bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20">
                <Zap className="w-5 h-5" /> Start Voting Round {votingRound}/{maxVotingRounds}
              </Button>
              <Button size="lg" variant="outline" onClick={resetGame} className="w-full">
                <ArrowLeft className="w-4 h-4" /> Back to Setup
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Voting phase
  if (phase === "voting") {
    const activePlayers = assignments.filter((a) => !eliminatedPlayers.includes(a.name));
    const mostVoted = findMostVoted();
    const remainingImposters = assignments.filter(
      (a) => a.isImposter && !eliminatedPlayers.includes(a.name)
    ).length;

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-6 pb-4">
          <button onClick={resetGame} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl font-bold">Voting Round {votingRound}/{maxVotingRounds}</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
          <div className="text-center max-w-sm w-full" style={{ animation: "slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
            <div className="w-16 h-16 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">Who is the Imposter?</h2>
            <p className="text-muted-foreground text-sm mb-2">Click player names to vote</p>
            <p className="text-xs text-muted-foreground font-mono mb-6">
              {remainingImposters} imposter{remainingImposters > 1 ? "s" : ""} remaining
            </p>

            <div className="space-y-2 mb-8">
              {activePlayers.map((player) => (
                <button
                  key={player.name}
                  onClick={() => handleVote(player.name)}
                  className={`w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
                    votes[player.name]
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : "bg-secondary border border-border hover:border-primary/20"
                  }`}
                >
                  {player.name} {votes[player.name] ? `(${votes[player.name]} votes)` : ""}
                </button>
              ))}
            </div>

            {mostVoted && (
              <Button size="xl" onClick={() => handleVoteOut(mostVoted)} className="w-full bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20">
                Vote Out: {mostVoted}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Vote-out confirmation phase
  if (phase === "vote-out") {
    const votedOutPlayer = assignments.find((a) => a.name === selectedVoteOut);
    const isImposter = votedOutPlayer?.isImposter || false;
    const remainingImposters = assignments.filter(
      (a) => a.isImposter && !eliminatedPlayers.includes(a.name) && a.name !== selectedVoteOut
    ).length;

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-6 pb-4">
          <button onClick={() => setPhase("voting")} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl font-bold">Confirm Vote</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
          <div className="text-center max-w-sm w-full" style={{ animation: "slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
              isImposter
                ? "bg-destructive/15 text-destructive"
                : "bg-primary/15 text-primary"
            }`}>
              <Eye className="w-8 h-8" />
            </div>
            <h2 className="font-display text-3xl font-bold mb-4">{selectedVoteOut}</h2>
            <p className="text-muted-foreground text-sm mb-8">
              Vote to eliminate this player?
            </p>

            {isImposter ? (
              <p className="text-xs font-mono text-destructive mb-6">
                Correct guess. {remainingImposters} imposter{remainingImposters !== 1 ? "s" : ""} will remain after this elimination.
              </p>
            ) : (
              <p className="text-xs font-mono text-muted-foreground mb-6">
                Wrong guess. The imposters stay hidden.
              </p>
            )}

            <div className="space-y-3">
              <Button size="xl" onClick={confirmVoteOut} className={`w-full ${
                isImposter
                  ? "bg-destructive/15 text-destructive hover:bg-destructive/25 border border-destructive/20"
                  : "bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20"
              }`}>
                <Zap className="w-5 h-5" /> Confirm
              </Button>
              <Button size="lg" variant="outline" onClick={() => setPhase("voting")} className="w-full">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Result phase - imposter revealed
  if (phase === "result") {
    const eliminatedImposters = assignments.filter(
      (a) => a.isImposter && eliminatedPlayers.includes(a.name)
    );

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-6 pb-4">
          <h1 className="font-display text-xl font-bold">Round Result</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
          <div className="text-center max-w-sm w-full" style={{ animation: "slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
            <div className="w-16 h-16 rounded-2xl bg-destructive/15 text-destructive flex items-center justify-center mx-auto mb-6">
              <Eye className="w-8 h-8" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">
              All imposters were voted out!
            </h2>
            <p className="text-muted-foreground text-sm mb-8 max-w-xs mx-auto">
              The regular players win. Reveal the word details below.
            </p>

            <div className="bg-card rounded-xl border border-border p-4 mb-6 text-left">
              <p className="text-xs font-mono text-muted-foreground mb-2">ELIMINATED IMPOSTERS</p>
              <p className="text-sm font-semibold text-foreground">
                {eliminatedImposters.map((p) => p.name).join(", ")}
              </p>
            </div>

            {!revealedWords && (
              <div className="bg-card rounded-2xl border-2 border-border p-8 mb-8">
                <p className="text-muted-foreground text-xs font-mono mb-2">MYSTERY WORD</p>
                <p className="font-display text-4xl font-bold text-muted-foreground">?????</p>
                <p className="text-sm text-muted-foreground mt-3">Let the imposters guess before revealing.</p>
              </div>
            )}

            {revealedWords && currentWord && (
              <div className="bg-card rounded-2xl border-2 border-primary/30 p-8 mb-8">
                <p className="text-muted-foreground text-xs font-mono mb-2">THE WORD:</p>
                <p className="font-display text-3xl font-bold text-primary mb-4">{currentWord.word}</p>
                <div className="text-left space-y-2">
                  <p className="text-sm"><span className="font-semibold">Theme:</span> {currentWord.theme}</p>
                  <p className="text-sm"><span className="font-semibold">Imposter's Word:</span> {currentWord.similar}</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {!revealedWords && (
                <Button size="xl" onClick={() => setRevealedWords(true)} className="w-full bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20">
                  <Eye className="w-5 h-5" /> Reveal Word
                </Button>
              )}
              <Button size="lg" onClick={startGame} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80">
                <RotateCcw className="w-4 h-4" /> New Round
              </Button>
              <Button size="lg" variant="outline" onClick={resetGame} className="w-full">
                <ArrowLeft className="w-4 h-4" /> Back to Setup
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game over phase
  if (phase === "game-over") {
    const remainingImposters = assignments.filter(
      (a) => a.isImposter && !eliminatedPlayers.includes(a.name)
    );

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-6 pb-4">
          <h1 className="font-display text-xl font-bold">Game Over</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
          <div className="text-center max-w-sm w-full" style={{ animation: "slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
            <div className="w-16 h-16 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mx-auto mb-6">
              <EyeOff className="w-8 h-8" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">Imposters Win!</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
              After {maxVotingRounds} voting rounds, not all imposters were eliminated.
            </p>

            {!revealedWords && (
              <div className="bg-card rounded-2xl border-2 border-border p-6 mb-8">
                <p className="text-muted-foreground text-xs font-mono mb-3">MYSTERY WORD</p>
                <p className="text-2xl font-bold text-muted-foreground">?????</p>
                <p className="text-xs text-muted-foreground mt-3">Click below to reveal</p>
              </div>
            )}

            {revealedWords && currentWord && (
              <div className="bg-card rounded-2xl border-2 border-primary/30 p-6 mb-8">
                <p className="text-muted-foreground text-xs font-mono mb-2">THE WORD WAS:</p>
                <p className="font-display text-3xl font-bold text-primary mb-4">{currentWord.word}</p>
                <div className="text-left space-y-2 text-sm">
                  <p><span className="font-semibold">Theme:</span> {currentWord.theme}</p>
                  <p>
                    <span className="font-semibold">Remaining imposters:</span> {remainingImposters.map((p) => p.name).join(", ")}
                  </p>
                  <p><span className="font-semibold">Imposter clue word:</span> {currentWord.similar}</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {!revealedWords && (
                <Button size="xl" onClick={() => setRevealedWords(true)} className="w-full bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20">
                  <Eye className="w-5 h-5" /> Reveal Words
                </Button>
              )}
              <Button size="lg" onClick={startGame} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80">
                <RotateCcw className="w-4 h-4" /> Play Again
              </Button>
              <Button size="lg" variant="outline" onClick={resetGame} className="w-full">
                <ArrowLeft className="w-4 h-4" /> Back to Setup
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default WordImposter;
