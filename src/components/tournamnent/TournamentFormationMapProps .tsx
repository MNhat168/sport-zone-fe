import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SportType } from '@/components/enums/ENUMS';

interface TournamentFormationMapProps {
    sportType: string;
    category: string;
    competitionFormat: string;
    participants: any[];
    teams: any[];
    maxParticipants: number;
    numberOfTeams: number;
    teamSize: number;
    currentTeams: number;
    onTeamClick?: (teamNumber: number) => void;
}

// Define a type for player positions
interface PlayerPosition {
    left: string;
    top: string;
    type: string;
}

const TournamentFormationMap: React.FC<TournamentFormationMapProps> = ({
    sportType,
    category,
    competitionFormat,
    participants,
    teams,
    maxParticipants,
    numberOfTeams,
    teamSize,
    currentTeams,
    onTeamClick
}) => {
    // Calculate the number of full vs incomplete teams
    const fullTeams = teams?.filter(team => team.isFull)?.length || 0;
    const incompleteTeams = currentTeams - fullTeams;
    const emptyTeams = numberOfTeams - currentTeams;

    // Helper function to generate team colors
    const getTeamColor = (teamNumber: number): string => {
        const colors = [
            '#EF4444', // Red
            '#3B82F6', // Blue
            '#10B981', // Green
            '#F59E0B', // Yellow
            '#8B5CF6', // Purple
            '#EC4899', // Pink
            '#06B6D4', // Cyan
            '#F97316', // Orange
            '#84CC16', // Lime
            '#6366F1', // Indigo
            '#14B8A6', // Teal
            '#F43F5E', // Rose
        ];
        return colors[(teamNumber - 1) % colors.length];
    };

    const renderFootballPlayers = (category: string, teamSize: number, teamColor: string) => {
        const positions: PlayerPosition[] = [];
        
        if (category === '5_a_side') {
            positions.push({ left: '4%', top: '50%', type: 'GK' }); // Goalkeeper
            positions.push({ left: '25%', top: '30%', type: 'D' }); // Defender
            positions.push({ left: '25%', top: '70%', type: 'D' }); // Defender
            positions.push({ left: '50%', top: '50%', type: 'M' }); // Midfielder
            positions.push({ left: '75%', top: '50%', type: 'F' }); // Forward
        } else if (category === '7_a_side') {
            positions.push({ left: '4%', top: '50%', type: 'GK' });
            positions.push({ left: '20%', top: '30%', type: 'D' });
            positions.push({ left: '20%', top: '70%', type: 'D' });
            positions.push({ left: '40%', top: '20%', type: 'M' });
            positions.push({ left: '40%', top: '50%', type: 'M' });
            positions.push({ left: '40%', top: '80%', type: 'M' });
            positions.push({ left: '70%', top: '50%', type: 'F' });
        } else { // 11_a_side default
            positions.push({ left: '4%', top: '50%', type: 'GK' });
            positions.push({ left: '15%', top: '20%', type: 'D' });
            positions.push({ left: '15%', top: '50%', type: 'D' });
            positions.push({ left: '15%', top: '80%', type: 'D' });
            positions.push({ left: '30%', top: '30%', type: 'M' });
            positions.push({ left: '30%', top: '70%', type: 'M' });
            positions.push({ left: '50%', top: '40%', type: 'M' });
            positions.push({ left: '50%', top: '60%', type: 'M' });
            positions.push({ left: '70%', top: '30%', type: 'F' });
            positions.push({ left: '70%', top: '50%', type: 'F' });
            positions.push({ left: '70%', top: '70%', type: 'F' });
        }

        return positions.slice(0, teamSize).map((pos, index) => (
            <div
                key={index}
                className="absolute w-4 h-4 rounded-full border border-white shadow-sm flex items-center justify-center text-[8px] font-bold"
                style={{
                    left: pos.left,
                    top: pos.top,
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: teamColor
                }}
            >
                {pos.type}
            </div>
        ));
    };

    const renderBasketballPlayers = (category: string, teamSize: number, teamColor: string) => {
        const positions: PlayerPosition[] = [];
        
        if (category === '3x3') {
            positions.push({ left: '30%', top: '50%', type: 'P' });
            positions.push({ left: '50%', top: '30%', type: 'P' });
            positions.push({ left: '50%', top: '70%', type: 'P' });
        } else { // 5x5
            positions.push({ left: '20%', top: '50%', type: 'PG' });
            positions.push({ left: '40%', top: '30%', type: 'SG' });
            positions.push({ left: '40%', top: '70%', type: 'SF' });
            positions.push({ left: '60%', top: '30%', type: 'PF' });
            positions.push({ left: '60%', top: '70%', type: 'C' });
        }

        return positions.slice(0, Math.min(teamSize, positions.length)).map((pos, index) => (
            <div
                key={index}
                className="absolute w-4 h-4 rounded-full border border-white shadow-sm flex items-center justify-center text-[8px] font-bold"
                style={{
                    left: pos.left,
                    top: pos.top,
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: teamColor
                }}
            >
                {pos.type}
            </div>
        ));
    };

    const renderFootballFormation = () => {
        const formations: Record<string, string[]> = {
            '5_a_side': ['1-2-1', '2-1-1', '1-1-2'],
            '7_a_side': ['2-3-1', '3-2-1', '2-2-2'],
            '11_a_side': ['4-4-2', '4-3-3', '3-5-2', '4-2-3-1']
        };

        const defaultFormation = category === '5_a_side' ? '1-2-1' :
            category === '7_a_side' ? '2-3-1' : '4-4-2';

        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h3 className="font-semibold mb-2">Suggested Formations</h3>
                    <div className="flex gap-2 justify-center flex-wrap">
                        {(formations[category] || [defaultFormation]).map((formation, index) => (
                            <div
                                key={index}
                                className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                            >
                                {formation}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Team Formation Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: numberOfTeams }).map((_, teamIndex) => {
                        const teamNumber = teamIndex + 1;
                        const team = teams?.find(t => t.teamNumber === teamNumber);
                        const isFull = team?.isFull || false;
                        const memberCount = team?.members?.length || 0;
                        const isEmpty = teamIndex >= currentTeams;
                        
                        const teamColor = team?.color || getTeamColor(teamNumber);
                        const teamName = team?.name || `Team ${teamNumber}`;

                        return (
                            <div
                                key={`team-${teamNumber}`}
                                className={`border-2 rounded-lg p-3 cursor-pointer transition-all hover:scale-105 ${isEmpty 
                                    ? 'border-gray-300 bg-gray-100' 
                                    : isFull 
                                        ? 'border-green-300 bg-green-50' 
                                        : 'border-yellow-300 bg-yellow-50'
                                }`}
                                onClick={() => onTeamClick && onTeamClick(teamNumber)}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div 
                                            className="w-3 h-3 rounded-full" 
                                            style={{ backgroundColor: teamColor }}
                                        />
                                        <span className="font-semibold text-sm">{teamName}</span>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${isEmpty 
                                        ? 'bg-gray-200 text-gray-700' 
                                        : isFull 
                                            ? 'bg-green-200 text-green-700' 
                                            : 'bg-yellow-200 text-yellow-700'
                                    }`}>
                                        {isEmpty ? 'Empty' : isFull ? 'Full' : `${memberCount}/${teamSize}`}
                                    </span>
                                </div>
                                
                                {/* Formation visualization for the team */}
                                <div className="relative h-20 border border-green-200 rounded-md bg-gradient-to-b from-green-50 to-white">
                                    {!isEmpty && (
                                        <>
                                            {/* Football field lines */}
                                            <div className="absolute inset-1 border border-green-200 rounded-sm"></div>
                                            
                                            {/* Player positions based on formation */}
                                            {renderFootballPlayers(category, teamSize, teamColor)}
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="text-center">
                    <div className="inline-flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-200 rounded-full"></div>
                            <span>Full Team ({fullTeams})</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-yellow-200 rounded-full"></div>
                            <span>Incomplete ({incompleteTeams})</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                            <span>Empty ({emptyTeams})</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderBasketballFormation = () => {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h3 className="font-semibold mb-2">Team Formations</h3>
                    <div className="flex gap-2 justify-center">
                        <div className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {category === '3x3' ? '3 Players' : '5 Players'} per Team
                        </div>
                    </div>
                </div>

                {/* Team Formation Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Array.from({ length: numberOfTeams }).map((_, teamIndex) => {
                        const teamNumber = teamIndex + 1;
                        const team = teams?.find(t => t.teamNumber === teamNumber);
                        const isFull = team?.isFull || false;
                        const memberCount = team?.members?.length || 0;
                        const isEmpty = teamIndex >= currentTeams;
                        
                        const teamColor = team?.color || getTeamColor(teamNumber);
                        const teamName = team?.name || `Team ${teamNumber}`;

                        return (
                            <div
                                key={`team-${teamNumber}`}
                                className={`border-2 rounded-lg p-3 cursor-pointer transition-all hover:scale-105 ${isEmpty 
                                    ? 'border-gray-300 bg-gray-100' 
                                    : isFull 
                                        ? 'border-blue-300 bg-blue-50' 
                                        : 'border-yellow-300 bg-yellow-50'
                                }`}
                                onClick={() => onTeamClick && onTeamClick(teamNumber)}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div 
                                            className="w-3 h-3 rounded-full" 
                                            style={{ backgroundColor: teamColor }}
                                        />
                                        <span className="font-semibold text-sm">{teamName}</span>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${isEmpty 
                                        ? 'bg-gray-200 text-gray-700' 
                                        : isFull 
                                            ? 'bg-blue-200 text-blue-700' 
                                            : 'bg-yellow-200 text-yellow-700'
                                    }`}>
                                        {isEmpty ? 'Empty' : isFull ? 'Full' : `${memberCount}/${teamSize}`}
                                    </span>
                                </div>
                                
                                {/* Basketball court visualization */}
                                <div className="relative h-20 border border-blue-200 rounded-md bg-gradient-to-b from-blue-50 to-white">
                                    {!isEmpty && (
                                        <>
                                            {/* Court outline */}
                                            <div className="absolute inset-1 border border-blue-200 rounded-sm"></div>
                                            
                                            {/* Center circle */}
                                            <div className="absolute top-1/2 left-1/2 w-6 h-6 border border-blue-300 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                                            
                                            {/* Player positions */}
                                            {renderBasketballPlayers(category, teamSize, teamColor)}
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="text-center">
                    <div className="inline-flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-blue-200 rounded-full"></div>
                            <span>Full Team ({fullTeams})</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-yellow-200 rounded-full"></div>
                            <span>Incomplete ({incompleteTeams})</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                            <span>Empty ({emptyTeams})</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderNetSportFormation = () => {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h3 className="font-semibold mb-2">Match Format</h3>
                    <div className="flex gap-2 justify-center">
                        <div className="px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                            {category === 'singles' ? 'Singles' : category === 'doubles' ? 'Doubles' : 'Mixed Doubles'}
                        </div>
                    </div>
                </div>

                {/* Match Pairings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: Math.ceil(numberOfTeams / 2) }).map((_, matchIndex) => {
                        const teamANumber = matchIndex * 2 + 1;
                        const teamBNumber = matchIndex * 2 + 2;
                        
                        const teamA = teams?.find(t => t.teamNumber === teamANumber);
                        const teamB = teams?.find(t => t.teamNumber === teamBNumber);
                        
                        const teamAColor = teamA?.color || getTeamColor(teamANumber);
                        const teamBColor = teamB?.color || getTeamColor(teamBNumber);
                        
                        const teamAName = teamA?.name || `Team ${teamANumber}`;
                        const teamBName = teamB?.name || `Team ${teamBNumber}`;
                        
                        const teamAIsEmpty = teamANumber > currentTeams;
                        const teamBIsEmpty = teamBNumber > currentTeams;

                        return (
                            <div 
                                key={`match-${matchIndex}`} 
                                className="border border-red-200 rounded-lg p-4 bg-gradient-to-b from-red-50 to-white"
                            >
                                <div className="text-center mb-3">
                                    <span className="text-sm font-semibold text-gray-700">Match {matchIndex + 1}</span>
                                </div>
                                
                                {/* Teams in match */}
                                <div className="flex justify-between items-center">
                                    {/* Team A */}
                                    <div 
                                        className={`flex flex-col items-center p-2 rounded-lg cursor-pointer transition-all hover:scale-105 ${teamAIsEmpty ? 'opacity-50' : ''}`}
                                        onClick={() => !teamAIsEmpty && onTeamClick && onTeamClick(teamANumber)}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <div 
                                                className="w-3 h-3 rounded-full" 
                                                style={{ backgroundColor: teamAColor }}
                                            />
                                            <span className="font-medium text-sm">{teamAName}</span>
                                        </div>
                                        {teamA && !teamAIsEmpty ? (
                                            <div className="text-xs text-gray-600">
                                                {teamA.members?.length || 0}/{teamSize} players
                                            </div>
                                        ) : (
                                            <div className="text-xs text-gray-400">Empty slot</div>
                                        )}
                                    </div>
                                    
                                    {/* VS */}
                                    <div className="px-3 py-1 bg-red-100 rounded-full text-red-700 font-bold text-sm">
                                        VS
                                    </div>
                                    
                                    {/* Team B */}
                                    <div 
                                        className={`flex flex-col items-center p-2 rounded-lg cursor-pointer transition-all hover:scale-105 ${teamBIsEmpty ? 'opacity-50' : ''}`}
                                        onClick={() => !teamBIsEmpty && onTeamClick && onTeamClick(teamBNumber)}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <div 
                                                className="w-3 h-3 rounded-full" 
                                                style={{ backgroundColor: teamBColor }}
                                            />
                                            <span className="font-medium text-sm">{teamBName}</span>
                                        </div>
                                        {teamB && !teamBIsEmpty ? (
                                            <div className="text-xs text-gray-600">
                                                {teamB.members?.length || 0}/{teamSize} players
                                            </div>
                                        ) : (
                                            <div className="text-xs text-gray-400">Empty slot</div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Court visualization for doubles */}
                                {(category === 'doubles' || category === 'mixed_doubles') && (
                                    <div className="relative h-20 border border-red-200 rounded-md mt-4">
                                        <div className="absolute inset-1 border border-red-200 rounded-sm"></div>
                                        
                                        {/* Net */}
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-0.5 bg-red-400"></div>
                                        
                                        {/* Player positions */}
                                        {!teamAIsEmpty && (
                                            <>
                                                <div 
                                                    className="absolute w-4 h-4 rounded-full border border-white shadow-sm"
                                                    style={{ left: '25%', top: '30%', backgroundColor: teamAColor }}
                                                />
                                                <div 
                                                    className="absolute w-4 h-4 rounded-full border border-white shadow-sm"
                                                    style={{ left: '25%', top: '70%', backgroundColor: teamAColor }}
                                                />
                                            </>
                                        )}
                                        
                                        {!teamBIsEmpty && (
                                            <>
                                                <div 
                                                    className="absolute w-4 h-4 rounded-full border border-white shadow-sm"
                                                    style={{ left: '75%', top: '30%', backgroundColor: teamBColor }}
                                                />
                                                <div 
                                                    className="absolute w-4 h-4 rounded-full border border-white shadow-sm"
                                                    style={{ left: '75%', top: '70%', backgroundColor: teamBColor }}
                                                />
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderTournamentBracket = () => {
        // const bracketSize = Math.pow(2, Math.ceil(Math.log2(Math.max(numberOfTeams, 2))));
        
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h3 className="font-semibold mb-2">Tournament Bracket</h3>
                    <div className="flex gap-2 justify-center">
                        <div className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                            {competitionFormat?.replace('_', ' ').toUpperCase()}
                        </div>
                        <div className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                            {numberOfTeams} Teams
                        </div>
                    </div>
                </div>

                {/* Teams overview */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {teams?.slice(0, 8).map((team) => (
                        <div 
                            key={team.teamNumber}
                            className="border border-purple-200 rounded-lg p-2 text-center cursor-pointer hover:bg-purple-50 transition-colors"
                            onClick={() => onTeamClick && onTeamClick(team.teamNumber)}
                        >
                            <div className="font-medium text-sm mb-1">Team {team.teamNumber}</div>
                            <div className="text-xs text-gray-600">
                                {team.members?.length || 0}/{teamSize} players
                            </div>
                        </div>
                    ))}
                    {numberOfTeams > 8 && (
                        <div className="border border-purple-200 rounded-lg p-2 text-center">
                            <div className="font-medium text-sm mb-1">+{numberOfTeams - 8} more</div>
                            <div className="text-xs text-gray-600">teams</div>
                        </div>
                    )}
                </div>

                {/* Bracket visualization */}
                <div className="relative min-h-64 p-4 border-2 border-purple-300 rounded-xl bg-gradient-to-b from-purple-50 to-white overflow-x-auto">
                    <div className="flex space-x-8 min-w-max">
                        {/* Round 1 */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-purple-700 text-center">Round 1</h4>
                            {[...Array(Math.ceil(numberOfTeams / 2))].map((_, i) => {
                                const teamANumber = i * 2 + 1;
                                const teamBNumber = i * 2 + 2;
                                
                                const teamA = teams?.find(t => t.teamNumber === teamANumber);
                                const teamB = teams?.find(t => t.teamNumber === teamBNumber);
                                
                                const teamAColor = teamA?.color || getTeamColor(teamANumber);
                                const teamBColor = teamB?.color || getTeamColor(teamBNumber);

                                return (
                                    <div 
                                        key={`r1-${i}`} 
                                        className="w-32 h-12 border border-purple-300 rounded-lg bg-white shadow-sm flex items-center justify-center cursor-pointer hover:bg-purple-50"
                                        onClick={() => {
                                            if (teamA && onTeamClick) onTeamClick(teamANumber);
                                            else if (teamB && onTeamClick) onTeamClick(teamBNumber);
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            {teamA && (
                                                <div 
                                                    className="w-3 h-3 rounded-full" 
                                                    style={{ backgroundColor: teamAColor }}
                                                />
                                            )}
                                            <div className="text-sm text-gray-600">
                                                Team {teamANumber} vs {teamBNumber <= numberOfTeams ? `Team ${teamBNumber}` : 'BYE'}
                                            </div>
                                            {teamB && (
                                                <div 
                                                    className="w-3 h-3 rounded-full" 
                                                    style={{ backgroundColor: teamBColor }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Quarter Finals */}
                        {numberOfTeams > 2 && (
                            <div className="space-y-4 pt-8">
                                <h4 className="font-semibold text-purple-700 text-center">Quarter Finals</h4>
                                {[...Array(Math.ceil(numberOfTeams / 4))].map((_, i) => (
                                    <div key={`qf-${i}`} className="w-32 h-12 border border-purple-300 rounded-lg bg-white shadow-sm flex items-center justify-center">
                                        <div className="text-sm text-gray-600">
                                            QF {i + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Semi Finals */}
                        {numberOfTeams > 4 && (
                            <div className="space-y-4 pt-16">
                                <h4 className="font-semibold text-purple-700 text-center">Semi Finals</h4>
                                {[...Array(Math.ceil(numberOfTeams / 8))].map((_, i) => (
                                    <div key={`sf-${i}`} className="w-32 h-12 border border-purple-300 rounded-lg bg-white shadow-sm flex items-center justify-center">
                                        <div className="text-sm text-gray-600">
                                            SF {i + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Final */}
                        <div className="space-y-4 pt-24">
                            <h4 className="font-semibold text-purple-700 text-center">Final</h4>
                            <div className="w-32 h-12 border-2 border-yellow-400 rounded-lg bg-yellow-50 shadow-md flex items-center justify-center">
                                <div className="text-sm font-semibold text-yellow-700">
                                    CHAMPIONSHIP
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const getSportSpecificFormation = () => {
        switch (sportType) {
            case SportType.FOOTBALL:
                return renderFootballFormation();
            case SportType.BASKETBALL:
                return renderBasketballFormation();
            case SportType.TENNIS:
            case SportType.BADMINTON:
            case SportType.PICKLEBALL:
                return renderNetSportFormation();
            case SportType.VOLLEYBALL:
                return renderNetSportFormation();
            default:
                return renderTournamentBracket();
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Team Formation & Structure</CardTitle>
                <CardDescription>
                    Visual representation of team formations and tournament structure.
                    {onTeamClick && " Click on a team to view details."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {getSportSpecificFormation()}

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Tournament Structure</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <div className="text-gray-600">Format</div>
                            <div className="font-medium">{competitionFormat?.replace('_', ' ').toUpperCase()}</div>
                        </div>
                        <div>
                            <div className="text-gray-600">Category</div>
                            <div className="font-medium">{category?.replace('_', ' ').toUpperCase()}</div>
                        </div>
                        <div>
                            <div className="text-gray-600">Teams</div>
                            <div className="font-medium">{currentTeams}/{numberOfTeams}</div>
                        </div>
                        <div>
                            <div className="text-gray-600">Participants</div>
                            <div className="font-medium">{participants.length}/{maxParticipants}</div>
                        </div>
                    </div>
                    
                    {/* Team size and format details */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 text-sm">
                        <div>
                            <div className="text-gray-600">Team Size</div>
                            <div className="font-medium">{teamSize} players</div>
                        </div>
                        <div>
                            <div className="text-gray-600">Full Teams</div>
                            <div className="font-medium">{fullTeams}</div>
                        </div>
                        <div>
                            <div className="text-gray-600">Remaining Spots</div>
                            <div className="font-medium">
                                {maxParticipants - participants.length} players
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default TournamentFormationMap;