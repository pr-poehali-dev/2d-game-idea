import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Location {
  id: string;
  name: string;
  x: number;
  y: number;
  type: 'city' | 'dungeon' | 'secret' | 'quest';
  description: string;
  discovered: boolean;
  icon: string;
}

interface Item {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: string;
}

interface Monster {
  name: string;
  hp: number;
  maxHp: number;
  level: number;
  icon: string;
  reward: number;
}

interface MathProblem {
  question: string;
  answer: number;
}

interface PlayerRecord {
  id: string;
  name: string;
  score: number;
  monstersDefeated: number;
  gold: number;
  level: number;
  timestamp: number;
}

const Index = () => {
  const [playerStats, setPlayerStats] = useState({
    name: 'Герой',
    level: 5,
    hp: 85,
    maxHp: 100,
    exp: 450,
    maxExp: 600,
    gold: 1250
  });

  const [inventory, setInventory] = useState<Item[]>([
    { id: '1', name: 'Меч героя', type: 'Оружие', description: 'Легендарный клинок', icon: '⚔️' },
    { id: '2', name: 'Зелье здоровья', type: 'Предмет', description: '+50 HP', icon: '🧪' },
    { id: '3', name: 'Древний ключ', type: 'Квест', description: 'Открывает тайную дверь', icon: '🗝️' }
  ]);

  const [locations, setLocations] = useState<Location[]>([
    { id: '1', name: 'Стартовая деревня', x: 50, y: 70, type: 'city', description: 'Мирное место, откуда начинается путешествие', discovered: true, icon: '🏘️' },
    { id: '2', name: 'Тёмный лес', x: 30, y: 45, type: 'dungeon', description: 'Опасное место, полное монстров', discovered: true, icon: '🌲' },
    { id: '3', name: 'Древний храм', x: 70, y: 30, type: 'secret', description: 'Загадочные руины древней цивилизации', discovered: false, icon: '🏛️' },
    { id: '4', name: 'Королевский город', x: 80, y: 60, type: 'city', description: 'Столица королевства', discovered: false, icon: '🏰' },
    { id: '5', name: 'Проклятая пещера', x: 20, y: 80, type: 'dungeon', description: 'Логово древнего дракона', discovered: false, icon: '⛰️' },
    { id: '6', name: 'Таинственный портал', x: 55, y: 20, type: 'quest', description: 'Ведёт в неизведанные миры', discovered: false, icon: '🌀' }
  ]);

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showInventory, setShowInventory] = useState(false);
  const [inBattle, setInBattle] = useState(false);
  const [currentMonster, setCurrentMonster] = useState<Monster | null>(null);
  const [mathProblem, setMathProblem] = useState<MathProblem | null>(null);
  const [playerAnswer, setPlayerAnswer] = useState('');
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [gameStats, setGameStats] = useState({
    monstersDefeated: 0,
    correctAnswers: 0,
    totalBattles: 0
  });
  const [leaderboard, setLeaderboard] = useState<PlayerRecord[]>(() => {
    const saved = localStorage.getItem('pixelquest_leaderboard');
    return saved ? JSON.parse(saved) : [];
  });

  const generateMathProblem = (level: number): MathProblem => {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, answer, question;
    
    if (operation === '+') {
      num1 = Math.floor(Math.random() * (10 * level)) + 1;
      num2 = Math.floor(Math.random() * (10 * level)) + 1;
      answer = num1 + num2;
      question = `${num1} + ${num2} = ?`;
    } else if (operation === '-') {
      num1 = Math.floor(Math.random() * (10 * level)) + 10;
      num2 = Math.floor(Math.random() * num1) + 1;
      answer = num1 - num2;
      question = `${num1} - ${num2} = ?`;
    } else {
      num1 = Math.floor(Math.random() * (5 * level)) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      answer = num1 * num2;
      question = `${num1} × ${num2} = ?`;
    }
    
    return { question, answer };
  };

  const startBattle = (location: Location) => {
    const monsters = [
      { name: 'Гоблин', hp: 30, maxHp: 30, level: 3, icon: '👹', reward: 50 },
      { name: 'Орк', hp: 50, maxHp: 50, level: 5, icon: '👺', reward: 100 },
      { name: 'Дракон', hp: 100, maxHp: 100, level: 8, icon: '🐉', reward: 300 },
      { name: 'Скелет', hp: 40, maxHp: 40, level: 4, icon: '💀', reward: 75 },
      { name: 'Тёмный маг', hp: 60, maxHp: 60, level: 6, icon: '🧙', reward: 150 }
    ];
    
    const monster = monsters[Math.floor(Math.random() * monsters.length)];
    setCurrentMonster(monster);
    setInBattle(true);
    setBattleLog([`Встречен ${monster.name} (Ур. ${monster.level})!`]);
    setMathProblem(generateMathProblem(monster.level));
  };

  const handleAttack = () => {
    if (!mathProblem || !currentMonster) return;
    
    const userAnswer = parseInt(playerAnswer);
    
    if (userAnswer === mathProblem.answer) {
      const damage = Math.floor(Math.random() * 20) + 15;
      const newMonsterHp = Math.max(0, currentMonster.hp - damage);
      
      setCurrentMonster({ ...currentMonster, hp: newMonsterHp });
      setBattleLog(prev => [...prev, `✓ Правильно! Урон: ${damage}`]);
      setGameStats(prev => ({ ...prev, correctAnswers: prev.correctAnswers + 1 }));
      
      if (newMonsterHp <= 0) {
        const newStats = {
          monstersDefeated: gameStats.monstersDefeated + 1,
          correctAnswers: gameStats.correctAnswers + 1,
          totalBattles: gameStats.totalBattles + 1
        };
        setGameStats(newStats);
        
        toast.success(`Победа! +${currentMonster.reward} золота`);
        setPlayerStats(prev => ({
          ...prev,
          gold: prev.gold + currentMonster.reward,
          exp: prev.exp + 50
        }));
        setBattleLog(prev => [...prev, `🏆 ${currentMonster.name} побеждён!`]);
        
        const newRecord: PlayerRecord = {
          id: Date.now().toString(),
          name: playerStats.name,
          score: playerStats.gold + currentMonster.reward,
          monstersDefeated: newStats.monstersDefeated,
          gold: playerStats.gold + currentMonster.reward,
          level: playerStats.level,
          timestamp: Date.now()
        };
        
        const updatedLeaderboard = [...leaderboard, newRecord]
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);
        setLeaderboard(updatedLeaderboard);
        localStorage.setItem('pixelquest_leaderboard', JSON.stringify(updatedLeaderboard));
        
        setTimeout(() => {
          setInBattle(false);
          setCurrentMonster(null);
          setBattleLog([]);
        }, 2000);
      } else {
        const monsterDamage = Math.floor(Math.random() * 15) + 5;
        setPlayerStats(prev => ({
          ...prev,
          hp: Math.max(0, prev.hp - monsterDamage)
        }));
        setBattleLog(prev => [...prev, `${currentMonster.name} атакует: -${monsterDamage} HP`]);
        setMathProblem(generateMathProblem(currentMonster.level));
      }
    } else {
      const monsterDamage = Math.floor(Math.random() * 20) + 10;
      setPlayerStats(prev => ({
        ...prev,
        hp: Math.max(0, prev.hp - monsterDamage)
      }));
      setBattleLog(prev => [...prev, `✗ Неверно! ${currentMonster.name} атакует: -${monsterDamage} HP`]);
      setMathProblem(generateMathProblem(currentMonster.level));
    }
    
    setPlayerAnswer('');
  };

  const handleLocationClick = (location: Location) => {
    if (!location.discovered) {
      const updatedLocations = locations.map(loc => 
        loc.id === location.id ? { ...loc, discovered: true } : loc
      );
      setLocations(updatedLocations);
      toast.success(`Открыто новое место: ${location.name}!`);
      
      const randomItems = [
        { id: Date.now().toString(), name: 'Артефакт силы', type: 'Артефакт', description: '+10 к атаке', icon: '💎' },
        { id: Date.now().toString(), name: 'Свиток знаний', type: 'Свиток', description: '+50 опыта', icon: '📜' },
        { id: Date.now().toString(), name: 'Магическая руна', type: 'Артефакт', description: 'Загадочная сила', icon: '🔮' }
      ];
      const randomItem = randomItems[Math.floor(Math.random() * randomItems.length)];
      setInventory([...inventory, randomItem]);
      toast.info(`Получен предмет: ${randomItem.name}!`);
    }
    setSelectedLocation(location);
  };

  const getLocationColor = (type: string) => {
    switch (type) {
      case 'city': return 'bg-accent';
      case 'dungeon': return 'bg-destructive';
      case 'secret': return 'bg-primary';
      case 'quest': return 'bg-secondary';
      default: return 'bg-muted';
    }
  };

  useEffect(() => {
    if (playerStats.hp <= 0) {
      toast.error('Поражение! HP восстановлено.');
      setInBattle(false);
      setCurrentMonster(null);
      setBattleLog([]);
      setPlayerStats(prev => ({ ...prev, hp: prev.maxHp }));
    }
  }, [playerStats.hp]);

  if (inBattle && currentMonster) {
    return (
      <div className="min-h-screen bg-background font-pixel text-foreground p-4 flex items-center justify-center">
        <Card className="w-full max-w-2xl p-6 bg-card border-2 border-destructive animate-fade-in">
          <div className="text-center mb-6">
            <h2 className="text-xl md:text-2xl text-destructive mb-2">⚔️ БОЙ ⚔️</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="text-4xl mb-2">⚔️</div>
              <div className="text-sm font-bold">{playerStats.name}</div>
              <Badge variant="secondary" className="text-xs mb-2">Ур. {playerStats.level}</Badge>
              <Progress value={(playerStats.hp / playerStats.maxHp) * 100} className="h-3 mb-1" />
              <div className="text-xs">{playerStats.hp}/{playerStats.maxHp} HP</div>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-2">{currentMonster.icon}</div>
              <div className="text-sm font-bold">{currentMonster.name}</div>
              <Badge variant="destructive" className="text-xs mb-2">Ур. {currentMonster.level}</Badge>
              <Progress value={(currentMonster.hp / currentMonster.maxHp) * 100} className="h-3 mb-1" />
              <div className="text-xs">{currentMonster.hp}/{currentMonster.maxHp} HP</div>
            </div>
          </div>

          {mathProblem && (
            <div className="bg-muted rounded-lg p-6 mb-4 border-2 border-primary">
              <div className="text-center mb-4">
                <div className="text-sm text-muted-foreground mb-2">Реши пример для атаки:</div>
                <div className="text-2xl md:text-3xl font-bold text-primary mb-4">{mathProblem.question}</div>
              </div>
              
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={playerAnswer}
                  onChange={(e) => setPlayerAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAttack()}
                  placeholder="Твой ответ"
                  className="text-center text-lg font-bold"
                  autoFocus
                />
                <Button onClick={handleAttack} size="lg" className="text-xs">
                  <Icon name="Swords" size={16} className="mr-2" />
                  Атака
                </Button>
              </div>
            </div>
          )}

          <Card className="bg-background p-3 max-h-32 overflow-y-auto">
            <div className="text-xs space-y-1">
              {battleLog.map((log, index) => (
                <div key={index} className="text-muted-foreground">{log}</div>
              ))}
            </div>
          </Card>

          <Button 
            onClick={() => {
              setInBattle(false);
              setCurrentMonster(null);
              setBattleLog([]);
              toast.info('Сбежал из боя');
            }}
            variant="outline"
            size="sm"
            className="w-full mt-4 text-xs"
          >
            Сбежать
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-pixel text-foreground p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="text-center py-6 animate-fade-in">
          <h1 className="text-2xl md:text-4xl text-primary mb-2">⚔️ PIXEL QUEST ⚔️</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Приключение начинается</p>
          <div className="flex justify-center gap-2 mt-4">
            <Button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Icon name="Trophy" size={14} className="mr-2" />
              {showLeaderboard ? 'Скрыть рекорды' : 'Таблица рекордов'}
            </Button>
          </div>
        </div>

        {showLeaderboard && (
          <Card className="p-4 bg-card border-2 border-primary animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="Trophy" size={20} className="text-primary" />
              <h2 className="text-base md:text-lg font-bold">ТАБЛИЦА ЛИДЕРОВ</h2>
            </div>
            
            <div className="mb-4 grid grid-cols-3 gap-2 text-xs">
              <Card className="p-3 bg-muted border border-border text-center">
                <div className="text-2xl mb-1">👹</div>
                <div className="text-muted-foreground">Побед</div>
                <div className="text-lg font-bold text-primary">{gameStats.monstersDefeated}</div>
              </Card>
              <Card className="p-3 bg-muted border border-border text-center">
                <div className="text-2xl mb-1">✓</div>
                <div className="text-muted-foreground">Верных</div>
                <div className="text-lg font-bold text-accent">{gameStats.correctAnswers}</div>
              </Card>
              <Card className="p-3 bg-muted border border-border text-center">
                <div className="text-2xl mb-1">⚔️</div>
                <div className="text-muted-foreground">Боёв</div>
                <div className="text-lg font-bold text-secondary">{gameStats.totalBattles}</div>
              </Card>
            </div>

            {leaderboard.length > 0 ? (
              <div className="space-y-2">
                {leaderboard.map((record, index) => (
                  <div
                    key={record.id}
                    className="flex items-center gap-3 p-3 bg-muted rounded border border-border"
                  >
                    <div className="text-xl font-bold w-8 text-center">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `#${index + 1}`}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold">{record.name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        Ур.{record.level} • {record.monstersDefeated} побед
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-secondary">{record.gold} 💰</div>
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(record.timestamp).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground py-8">
                Побеждай монстров, чтобы попасть в таблицу! 🏆
              </div>
            )}
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-4 bg-card border-2 border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm md:text-base flex items-center gap-2">
                  <Icon name="Map" size={20} />
                  КАРТА МИРА
                </h2>
                <Badge variant="outline" className="text-xs">
                  {locations.filter(l => l.discovered).length}/{locations.length} открыто
                </Badge>
              </div>
              
              <div className="relative w-full aspect-square bg-muted rounded border-2 border-border overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, hsl(var(--border)) 0px, hsl(var(--border)) 1px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, hsl(var(--border)) 0px, hsl(var(--border)) 1px, transparent 1px, transparent 20px)',
                  backgroundSize: '20px 20px'
                }} />
                
                {locations.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleLocationClick(location)}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                      location.discovered 
                        ? 'opacity-100 hover:scale-125 animate-float' 
                        : 'opacity-50 hover:opacity-75 animate-pulse'
                    }`}
                    style={{ left: `${location.x}%`, top: `${location.y}%` }}
                  >
                    <div className={`${getLocationColor(location.type)} rounded-full p-2 md:p-3 border-2 border-foreground shadow-lg`}>
                      <span className="text-xl md:text-2xl">{location.icon}</span>
                    </div>
                    {location.discovered && (
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                        <span className="text-[8px] md:text-xs bg-background/90 px-2 py-1 rounded border border-border">
                          {location.name}
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </Card>

            {selectedLocation && (
              <Card className="p-4 bg-card border-2 border-primary animate-fade-in">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedLocation.icon}</span>
                    <div>
                      <h3 className="text-sm md:text-base font-bold">{selectedLocation.name}</h3>
                      <Badge className={`${getLocationColor(selectedLocation.type)} text-xs mt-1`}>
                        {selectedLocation.type === 'city' && 'Город'}
                        {selectedLocation.type === 'dungeon' && 'Подземелье'}
                        {selectedLocation.type === 'secret' && 'Тайное место'}
                        {selectedLocation.type === 'quest' && 'Квест'}
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setSelectedLocation(null)}
                  >
                    <Icon name="X" size={16} />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{selectedLocation.description}</p>
                {selectedLocation.discovered && (
                  <div className="grid grid-cols-2 gap-2">
                    {(selectedLocation.type === 'dungeon' || selectedLocation.type === 'secret') && (
                      <Button 
                        onClick={() => startBattle(selectedLocation)} 
                        variant="destructive"
                        className="text-xs" 
                        size="sm"
                      >
                        <Icon name="Swords" size={14} className="mr-2" />
                        В бой!
                      </Button>
                    )}
                    <Button className="text-xs" size="sm">
                      <Icon name="ArrowRight" size={14} className="mr-2" />
                      Исследовать
                    </Button>
                  </div>
                )}
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card className="p-4 bg-card border-2 border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-primary rounded border-2 border-foreground flex items-center justify-center text-2xl">
                  ⚔️
                </div>
                <div className="flex-1">
                  <h3 className="text-sm md:text-base font-bold">{playerStats.name}</h3>
                  <Badge variant="secondary" className="text-xs">Ур. {playerStats.level}</Badge>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="flex items-center gap-1">
                      <Icon name="Heart" size={12} />
                      HP
                    </span>
                    <span>{playerStats.hp}/{playerStats.maxHp}</span>
                  </div>
                  <Progress value={(playerStats.hp / playerStats.maxHp) * 100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="flex items-center gap-1">
                      <Icon name="Zap" size={12} />
                      EXP
                    </span>
                    <span>{playerStats.exp}/{playerStats.maxExp}</span>
                  </div>
                  <Progress value={(playerStats.exp / playerStats.maxExp) * 100} className="h-2" />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="flex items-center gap-1">
                    <Icon name="Coins" size={12} />
                    Золото
                  </span>
                  <span className="font-bold text-secondary">{playerStats.gold}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card border-2 border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm md:text-base flex items-center gap-2">
                  <Icon name="Backpack" size={16} />
                  ИНВЕНТАРЬ
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowInventory(!showInventory)}
                >
                  <Icon name={showInventory ? "ChevronUp" : "ChevronDown"} size={16} />
                </Button>
              </div>

              {showInventory && (
                <div className="space-y-2 animate-fade-in">
                  {inventory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2 bg-muted rounded border border-border hover:border-primary transition-colors cursor-pointer"
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold truncate">{item.name}</div>
                        <div className="text-[10px] text-muted-foreground">{item.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!showInventory && (
                <div className="text-xs text-center text-muted-foreground py-2">
                  Предметов: {inventory.length}
                </div>
              )}
            </Card>

            <Card className="p-4 bg-card border-2 border-border">
              <h3 className="text-sm md:text-base mb-3 flex items-center gap-2">
                <Icon name="Scroll" size={16} />
                КВЕСТЫ
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-2 bg-muted rounded border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name="Target" size={12} />
                    <span className="font-bold">Исследователь</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Открой все локации на карте</p>
                  <Progress value={33} className="h-1 mt-2" />
                </div>
                <div className="p-2 bg-muted rounded border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name="Swords" size={12} />
                    <span className="font-bold">Охотник на драконов</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Победи древнего дракона</p>
                  <Progress value={0} className="h-1 mt-2" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;