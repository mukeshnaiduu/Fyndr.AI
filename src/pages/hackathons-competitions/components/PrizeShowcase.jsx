import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import Button from 'components/ui/Button';

const PrizeShowcase = ({ hackathonId }) => {
  const [activeTab, setActiveTab] = useState('current');

  const currentPrizes = [
    {
      id: 1,
      position: 1,
      title: "Grand Prize Winner",
      amount: "$10,000",
      description: "Cash prize plus mentorship program with industry leaders",
      sponsor: {
        name: "TechCorp",
        logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150",
        tier: "Platinum"
      },
      benefits: [
        "Cash prize of $10,000",
        "6-month mentorship program",
        "Job interview opportunity",
        "Featured on company blog",
        "Access to exclusive events"
      ],
      icon: "Crown",
      color: "text-warning bg-warning/10 border-warning/20"
    },
    {
      id: 2,
      position: 2,
      title: "Runner-up Prize",
      amount: "$5,000",
      description: "Cash prize and internship opportunity",
      sponsor: {
        name: "InnovateLab",
        logo: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150",
        tier: "Gold"
      },
      benefits: [
        "Cash prize of $5,000",
        "3-month internship offer",
        "Technical workshop access",
        "Networking opportunities"
      ],
      icon: "Medal",
      color: "text-muted-foreground bg-muted/10 border-muted/20"
    },
    {
      id: 3,
      position: 3,
      title: "Third Place",
      amount: "$2,500",
      description: "Cash prize and development resources",
      sponsor: {
        name: "DevTools Inc",
        logo: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=150",
        tier: "Silver"
      },
      benefits: [
        "Cash prize of $2,500",
        "Free development tools license",
        "Code review session",
        "Certificate of achievement"
      ],
      icon: "Award",
      color: "text-warning bg-warning/10 border-warning/20"
    }
  ];

  const specialPrizes = [
    {
      id: 4,
      title: "Best Innovation Award",
      amount: "$1,500",
      description: "For the most innovative solution",
      sponsor: {
        name: "Innovation Hub",
        logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150"
      },
      icon: "Lightbulb",
      color: "text-accent bg-accent/10 border-accent/20"
    },
    {
      id: 5,
      title: "Best Design Award",
      amount: "$1,000",
      description: "For exceptional user experience design",
      sponsor: {
        name: "Design Studio",
        logo: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150"
      },
      icon: "Palette",
      color: "text-primary bg-primary/10 border-primary/20"
    },
    {
      id: 6,
      title: "People\'s Choice Award",
      amount: "$750",
      description: "Voted by the community",
      sponsor: {
        name: "Community Fund",
        logo: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=150"
      },
      icon: "Heart",
      color: "text-error bg-error/10 border-error/20"
    }
  ];

  const previousWinners = [
    {
      id: 1,
      hackathon: "AI Innovation Challenge 2024",
      date: "March 2024",
      winner: {
        team: "Neural Networks",
        project: "AI-Powered Healthcare Assistant",
        members: [
          { name: "Alice Johnson", avatar: "https://images.unsplash.com/photo-1494790108755-2616b9c5e8b8?w=150" },
          { name: "Bob Smith", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
          { name: "Carol Davis", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150" }
        ]
      },
      prize: "$15,000",
      description: "Revolutionary AI assistant that helps doctors diagnose diseases faster and more accurately.",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400"
    },
    {
      id: 2,
      hackathon: "Blockchain Revolution 2024",
      date: "January 2024",
      winner: {
        team: "Crypto Pioneers",
        project: "Decentralized Voting System",
        members: [
          { name: "David Wilson", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150" },
          { name: "Emma Brown", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150" }
        ]
      },
      prize: "$12,000",
      description: "Secure and transparent voting system built on blockchain technology.",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400"
    },
    {
      id: 3,
      hackathon: "Green Tech Challenge 2023",
      date: "November 2023",
      winner: {
        team: "EcoWarriors",
        project: "Smart Energy Management",
        members: [
          { name: "Frank Miller", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" },
          { name: "Grace Lee", avatar: "https://images.unsplash.com/photo-1494790108755-2616b9c5e8b8?w=150" },
          { name: "Henry Chen", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
          { name: "Ivy Wang", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150" }
        ]
      },
      prize: "$8,000",
      description: "IoT-based system for optimizing energy consumption in smart homes.",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"
    }
  ];

  const totalPrizePool = [...currentPrizes, ...specialPrizes]
    .reduce((total, prize) => total + parseInt(prize.amount.replace(/[$,]/g, '')), 0);

  return (
    <div className="glassmorphic rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Icon name="Trophy" size={24} className="text-warning" />
          <h2 className="text-xl font-semibold text-foreground">Prize Showcase</h2>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Prize Pool</p>
          <p className="text-2xl font-bold text-warning">${totalPrizePool.toLocaleString()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 bg-white/5 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab('current')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-spring ${
            activeTab === 'current' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Icon name="Gift" size={16} />
          <span>Current Prizes</span>
        </button>
        <button
          onClick={() => setActiveTab('winners')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-spring ${
            activeTab === 'winners' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Icon name="Users" size={16} />
          <span>Previous Winners</span>
        </button>
      </div>

      {activeTab === 'current' && (
        <div className="space-y-6">
          {/* Main Prizes */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Main Prizes</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentPrizes.map((prize) => (
                <div
                  key={prize.id}
                  className={`bg-white/5 rounded-lg p-4 border transition-spring hover:shadow-elevation-1 ${prize.color}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Icon name={prize.icon} size={20} />
                      <span className="font-medium">#{prize.position}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{prize.amount}</p>
                    </div>
                  </div>

                  <h4 className="font-semibold text-foreground mb-2">{prize.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{prize.description}</p>

                  {/* Sponsor */}
                  <div className="flex items-center space-x-2 mb-3 p-2 bg-white/5 rounded-lg">
                    <Image
                      src={prize.sponsor.logo}
                      alt={prize.sponsor.name}
                      className="w-8 h-8 rounded"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">{prize.sponsor.name}</p>
                      <p className="text-xs text-muted-foreground">{prize.sponsor.tier} Sponsor</p>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Benefits Include:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {prize.benefits.slice(0, 3).map((benefit, index) => (
                        <li key={index} className="flex items-center space-x-1">
                          <Icon name="Check" size={12} className="text-success" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                      {prize.benefits.length > 3 && (
                        <li className="text-primary cursor-pointer hover:underline">
                          +{prize.benefits.length - 3} more benefits
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Special Prizes */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Special Awards</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {specialPrizes.map((prize) => (
                <div
                  key={prize.id}
                  className={`bg-white/5 rounded-lg p-4 border transition-spring hover:shadow-elevation-1 ${prize.color}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Icon name={prize.icon} size={20} />
                    <p className="text-lg font-bold text-foreground">{prize.amount}</p>
                  </div>

                  <h4 className="font-semibold text-foreground mb-2">{prize.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{prize.description}</p>

                  <div className="flex items-center space-x-2 p-2 bg-white/5 rounded-lg">
                    <Image
                      src={prize.sponsor.logo}
                      alt={prize.sponsor.name}
                      className="w-6 h-6 rounded"
                    />
                    <p className="text-sm text-foreground">{prize.sponsor.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sponsor Recognition */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h3 className="text-lg font-semibold text-foreground mb-3">Our Sponsors</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Special thanks to our amazing sponsors who make these prizes possible!
            </p>
            <Button variant="outline" size="sm">
              <Icon name="ExternalLink" size={16} className="mr-2" />
              View All Sponsors
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'winners' && (
        <div className="space-y-6">
          {previousWinners.map((winner) => (
            <div key={winner.id} className="bg-white/5 rounded-lg p-6 border border-white/10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6 space-y-4 lg:space-y-0">
                {/* Project Image */}
                <div className="lg:w-48 lg:h-32 w-full h-48 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={winner.image}
                    alt={winner.winner.project}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{winner.winner.project}</h3>
                      <p className="text-sm text-muted-foreground">
                        {winner.hackathon} • {winner.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        <Icon name="Trophy" size={16} className="text-warning" />
                        <span className="text-lg font-bold text-warning">{winner.prize}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Grand Prize</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{winner.description}</p>

                  {/* Team Members */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Team: {winner.winner.team}</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center -space-x-2">
                          {winner.winner.members.map((member, index) => (
                            <Image
                              key={index}
                              src={member.avatar}
                              alt={member.name}
                              className="w-6 h-6 rounded-full border-2 border-card"
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {winner.winner.members.length} members
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Icon name="ExternalLink" size={16} className="mr-2" />
                      View Project
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="text-center">
            <Button variant="outline">
              View All Previous Winners
              <Icon name="ArrowRight" size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrizeShowcase;
