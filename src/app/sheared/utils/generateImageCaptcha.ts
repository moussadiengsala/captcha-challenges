import { ChallengeImageTypes, Challenges, Icon, ImageCaptcha } from './types';

const allIcons: Icon[] = [
    // Nature (4 Nature, 5 Non-Nature)
    { id: '1-tree', name: 'Tree', icon: '🌳', challengeImageType: [ChallengeImageTypes.Nature, ChallengeImageTypes.Living] },
    { id: '2-mountain', name: 'Mountain', icon: '⛰️', challengeImageType: [ChallengeImageTypes.Nature] },
    { id: '17-lake', name: 'Lake', icon: '🏞️', challengeImageType: [ChallengeImageTypes.Nature] },
    { id: '18-jungle', name: 'Jungle', icon: '🌴', challengeImageType: [ChallengeImageTypes.Nature, ChallengeImageTypes.Living] },
    { id: '3-car', name: 'Car', icon: '🚗', challengeImageType: [ChallengeImageTypes.Vehicle] },
    { id: '7-phone', name: 'Phone', icon: '📱', challengeImageType: [ChallengeImageTypes.Technology] },
    { id: '9-burger', name: 'Burger', icon: '🍔', challengeImageType: [ChallengeImageTypes.Food] },
    { id: '11-bridge', name: 'Bridge', icon: '🌉', challengeImageType: [ChallengeImageTypes.Architecture] },
    { id: '13-football', name: 'Football', icon: '⚽', challengeImageType: [ChallengeImageTypes.Sports] },
  
    // Vehicle (4 Vehicle, 5 Non-Vehicle)
    { id: '4-airplane', name: 'Airplane', icon: '✈️', challengeImageType: [ChallengeImageTypes.Vehicle] },
    { id: '20-train', name: 'Train', icon: '🚆', challengeImageType: [ChallengeImageTypes.Vehicle] },
    { id: '21-motorcycle', name: 'Motorcycle', icon: '🏍️', challengeImageType: [ChallengeImageTypes.Vehicle] },
    { id: '5-dog', name: 'Dog', icon: '🐕', challengeImageType: [ChallengeImageTypes.Animal, ChallengeImageTypes.Living] },
  
    // Animal (4 Animal, 5 Non-Animal)
    { id: '6-cat', name: 'Cat', icon: '🐈', challengeImageType: [ChallengeImageTypes.Animal, ChallengeImageTypes.Living] },
    { id: '22-lion', name: 'Lion', icon: '🦁', challengeImageType: [ChallengeImageTypes.Animal] },
    { id: '23-elephant', name: 'Elephant', icon: '🐘', challengeImageType: [ChallengeImageTypes.Animal] },
  
    // Technology (4 Technology, 5 Non-Technology)
    { id: '8-computer', name: 'Computer', icon: '💻', challengeImageType: [ChallengeImageTypes.Technology] },
    { id: '19-robot', name: 'Robot', icon: '🤖', challengeImageType: [ChallengeImageTypes.Technology] },
    { id: '24-smartwatch', name: 'Smartwatch', icon: '⌚', challengeImageType: [ChallengeImageTypes.Technology] },
  
    // Food (4 Food, 5 Non-Food)
    { id: '10-apple', name: 'Apple', icon: '🍎', challengeImageType: [ChallengeImageTypes.Food, ChallengeImageTypes.Living] },
    { id: '25-pizza', name: 'Pizza', icon: '🍕', challengeImageType: [ChallengeImageTypes.Food] },
    { id: '26-cake', name: 'Cake', icon: '🍰', challengeImageType: [ChallengeImageTypes.Food] },
  
    // Architecture (4 Architecture, 5 Non-Architecture),
    { id: '12-building', name: 'Building', icon: '🏢', challengeImageType: [ChallengeImageTypes.Architecture] },
    { id: '27-castle', name: 'Castle', icon: '🏰', challengeImageType: [ChallengeImageTypes.Architecture] },
    { id: '28-lighthouse', name: 'Lighthouse', icon: '🚨', challengeImageType: [ChallengeImageTypes.Architecture] },
  
    // Sports (4 Sports, 5 Non-Sports)
    { id: '14-basketball', name: 'Basketball', icon: '🏀', challengeImageType: [ChallengeImageTypes.Sports] },
    { id: '29-tennis', name: 'Tennis', icon: '🎾', challengeImageType: [ChallengeImageTypes.Sports] },
    { id: '30-baseball', name: 'Baseball', icon: '⚾', challengeImageType: [ChallengeImageTypes.Sports] },
  
    // Art (4 Art, 5 Non-Art)
    { id: '15-painting', name: 'Painting', icon: '🖼️', challengeImageType: [ChallengeImageTypes.Art] },
    { id: '16-sculpture', name: 'Sculpture', icon: '🗿', challengeImageType: [ChallengeImageTypes.Art] },
    { id: '31-palette', name: 'Palette', icon: '🎨', challengeImageType: [ChallengeImageTypes.Art] },
    { id: '32-museum', name: 'Museum', icon: '🏛️', challengeImageType: [ChallengeImageTypes.Art, ChallengeImageTypes.Architecture] },
];

const challenges: Challenges[] = [
    { message: 'Select all living things (humans, plants, animals)', challenge: ChallengeImageTypes.Living },
    { message: 'Identify all technological items (phones, computers, gadgets)', challenge: ChallengeImageTypes.Technology },
    { message: 'Pick all vehicles (cars, bikes, airplanes)', challenge: ChallengeImageTypes.Vehicle },
    { message: 'Spot all animals (dogs, cats, birds)', challenge: ChallengeImageTypes.Animal },
    { message: 'Choose images of natural scenery (trees, mountains, rivers)', challenge: ChallengeImageTypes.Nature },
    { message: 'Find all food items (fruits, vegetables, meals)', challenge: ChallengeImageTypes.Food },
    { message: 'Locate architectural structures (buildings, bridges, monuments)', challenge: ChallengeImageTypes.Architecture },
    { message: 'Recognize artistic works (paintings, sculptures, installations)', challenge: ChallengeImageTypes.Art },
    { message: 'Select sports-related images (balls, stadiums, players)', challenge: ChallengeImageTypes.Sports },
];

// Utility to shuffle an array
const shuffleArray = <T>(array: T[]): T[] => array.sort(() => Math.random() - 0.5);

const getChallenge = (): Challenges => challenges[Math.floor(Math.random() * challenges.length)];

export function generateImageCaptcha(): ImageCaptcha {
    const challenge = getChallenge();

    // Filter icons matching the challenge
    const correctIcons = shuffleArray(
        allIcons.filter(icon => icon.challengeImageType.includes(challenge.challenge))
    ).slice(0, 4);

    // Filter icons NOT matching the challenge
    const incorrectIcons = shuffleArray(
        allIcons.filter(icon => !icon.challengeImageType.includes(challenge.challenge))
    ).slice(0, 5);

    // console.log(correctIcons);
    // console.log(incorrectIcons)
    // Combine correct and incorrect icons
    const allIconsForCaptcha = shuffleArray([...correctIcons, ...incorrectIcons]);

    return {
        challenge,
        solutions: correctIcons,
        all: allIconsForCaptcha,
    };
}
