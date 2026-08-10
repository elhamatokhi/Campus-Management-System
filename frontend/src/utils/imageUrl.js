import campusHero from '../assets/campus-hero.png';

export function eventImageUrl(imageUrl) {
  if (!imageUrl || imageUrl.includes('example.com')) {
    return campusHero;
  }

  return imageUrl;
}

