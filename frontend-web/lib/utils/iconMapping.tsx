import { 
  BookOpen, 
  Folder, 
  Globe, 
  Heart, 
  Star, 
  Users, 
  Zap, 
  Coffee,
  Music,
  Film,
  Palette,
  Code,
  Gamepad2,
  Lightbulb,
  Award,
  Briefcase,
  Camera,
  Clock,
  Compass,
  Cpu,
  Home,
  Leaf,
  Map,
  Moon,
  Rocket,
  Shield,
  Sparkles,
  Sun,
  Target,
  Trophy,
  Laptop,
  Microscope,
  FlaskConical,
  GraduationCap,
  BookMarked,
  Library,
  Newspaper,
  BookText,
  BookCopy,
  Brain,
  Theater,
  Plane,
  TreePine,
  Mountain,
  Waves,
  LucideIcon
} from 'lucide-react';

export interface IconOption {
  name: string;
  label: string;
  Icon: LucideIcon;
}

// Daftar icon yang tersedia untuk kategori
export const availableIcons: IconOption[] = [
  { name: 'book-open', label: 'Book Open', Icon: BookOpen },
  { name: 'folder', label: 'Folder', Icon: Folder },
  { name: 'library', label: 'Library', Icon: Library },
  { name: 'book-marked', label: 'Book Marked', Icon: BookMarked },
  { name: 'book-text', label: 'Book Text', Icon: BookText },
  { name: 'book-copy', label: 'Book Copy', Icon: BookCopy },
  { name: 'graduation-cap', label: 'Education', Icon: GraduationCap },
  { name: 'brain', label: 'Brain', Icon: Brain },
  { name: 'microscope', label: 'Science', Icon: Microscope },
  { name: 'flask-conical', label: 'Laboratory', Icon: FlaskConical },
  { name: 'laptop', label: 'Technology', Icon: Laptop },
  { name: 'code', label: 'Programming', Icon: Code },
  { name: 'cpu', label: 'Computer', Icon: Cpu },
  { name: 'palette', label: 'Art', Icon: Palette },
  { name: 'music', label: 'Music', Icon: Music },
  { name: 'film', label: 'Movie', Icon: Film },
  { name: 'theater', label: 'Theater', Icon: Theater },
  { name: 'camera', label: 'Photography', Icon: Camera },
  { name: 'gamepad2', label: 'Games', Icon: Gamepad2 },
  { name: 'heart', label: 'Romance', Icon: Heart },
  { name: 'star', label: 'Featured', Icon: Star },
  { name: 'sparkles', label: 'Fantasy', Icon: Sparkles },
  { name: 'zap', label: 'Action', Icon: Zap },
  { name: 'rocket', label: 'Space', Icon: Rocket },
  { name: 'shield', label: 'Adventure', Icon: Shield },
  { name: 'trophy', label: 'Sports', Icon: Trophy },
  { name: 'globe', label: 'Geography', Icon: Globe },
  { name: 'map', label: 'Travel', Icon: Map },
  { name: 'compass', label: 'Navigation', Icon: Compass },
  { name: 'plane', label: 'Aviation', Icon: Plane },
  { name: 'mountain', label: 'Mountain', Icon: Mountain },
  { name: 'tree-pine', label: 'Nature', Icon: TreePine },
  { name: 'waves', label: 'Ocean', Icon: Waves },
  { name: 'leaf', label: 'Environment', Icon: Leaf },
  { name: 'sun', label: 'Day', Icon: Sun },
  { name: 'moon', label: 'Night', Icon: Moon },
  { name: 'coffee', label: 'Lifestyle', Icon: Coffee },
  { name: 'home', label: 'Home', Icon: Home },
  { name: 'users', label: 'Social', Icon: Users },
  { name: 'briefcase', label: 'Business', Icon: Briefcase },
  { name: 'lightbulb', label: 'Ideas', Icon: Lightbulb },
  { name: 'award', label: 'Achievement', Icon: Award },
  { name: 'target', label: 'Goals', Icon: Target },
  { name: 'clock', label: 'History', Icon: Clock },
  { name: 'newspaper', label: 'News', Icon: Newspaper },
];

// Function untuk mendapatkan icon component berdasarkan nama
export const getIconByName = (iconName: string | null | undefined): LucideIcon => {
  if (!iconName) return Folder; // Default icon
  
  const iconOption = availableIcons.find(icon => icon.name === iconName);
  return iconOption ? iconOption.Icon : Folder;
};

// Function untuk render icon dinamis
export const renderIcon = (iconName: string | null | undefined, className?: string) => {
  const IconComponent = getIconByName(iconName);
  return <IconComponent className={className} />;
};
