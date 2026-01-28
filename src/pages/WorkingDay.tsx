import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTasks } from "@/contexts/TaskContext";
import { Award } from "lucide-react";
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

const WorkingDays: React.FC = () => {
    const navigate = useNavigate();
    const { t, isRTL } = useLanguage();
    const {
        tasks: allTasks,
        loading
    } = useTasks();
    const summary = useMemo(() => {
        // We will return an object containing the list of dates AND the grouped data
        const allUniqueDates = new Set();

        const groupMap = allTasks.reduce((acc, task) => {
            const { supervisorId, supervisorName, date, taskPoint, taskCount } = task;
            const day = date.split('T')[0];

            // Add date to our master set
            allUniqueDates.add(day);

            if (!acc[supervisorId]) {
                acc[supervisorId] = {
                    id: supervisorId,
                    name: supervisorName,
                    records: {}
                };
            }

            if (!acc[supervisorId].records[day]) {
                acc[supervisorId].records[day] = {
                    date: day,
                    points: 0,
                    tasks: 0
                };
            }

            acc[supervisorId].records[day].points += taskPoint;
            acc[supervisorId].records[day].tasks += taskCount;

            return acc;
        }, {});

        // Convert to the final desired structure
        return {
            // Array of all unique dates found across all tasks, sorted newest first
            availableDates: Array.from(allUniqueDates).sort((a, b) => a.localeCompare(b)),

            // The grouped supervisor data
            supervisors: Object.values(groupMap).map(sup => ({
                ...sup,
                records: Object.values(sup.records).sort((a, b) => b.date.localeCompare(a.date))
            }))
        };
    }, [allTasks]);

    console.log(summary, "summary")

    return (
        <Layout>
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-primary" />
                        {t('dashboard.allSupervisorWorkingDays')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead colSpan={2} className={`${isRTL ? 'border-l' : 'border-r'}`}>{t('dashboard.name')}</TableHead>
                                {summary?.availableDates.map(date => (
                                    <TableHead key={date} className={`text-center ${isRTL ? 'border-l' : 'border-r'}`} colSpan={2}>
                                        {new Date(date).toLocaleDateString()}
                                    </TableHead>
                                ))}

                            </TableRow>
                            <TableRow>
                                <TableHead colSpan={2}>-</TableHead>
                                {
                                    summary?.availableDates?.map(date => (
                                        <React.Fragment key={`${date}-sub`}>
                                            <TableHead className={`text-center ${isRTL ? 'border-r' : 'border-l'}`}>{t('dashboard.tasks')}</TableHead>
                                            <TableHead className={`text-center ${isRTL ? 'border-l' : 'border-r'}`}>{t('dashboard.totalPoints')}</TableHead>
                                        </React.Fragment>
                                    ))
                                }
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {summary?.supervisors?.map((stat, index) => {
                                return (
                                    <TableRow
                                        key={stat.id}
                                        className="hover:bg-muted/50 transition-colors animate-slide-up cursor-pointer group"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                        onClick={() => navigate(`/supervisor/${stat.id}`)}
                                    >
                                        <TableCell colSpan={2}>
                                            <div>
                                                <p className="font-medium group-hover:text-primary transition-colors">{stat.name}</p>
                                            </div>
                                        </TableCell>
                                        {summary.availableDates.map(date => {
                                            const record = stat.records.find(r => r.date === date);
                                            return (
                                                <React.Fragment key={`${stat.id}-${date}`} colSpan={2} className="text-center border-r">
                                                    <TableCell className={`text-center ${isRTL ? 'border-r' : 'border-l'}`}>{record?.tasks || 'No Rec.'}</TableCell>
                                                    <TableCell className={`text-center ${isRTL ? 'border-l' : 'border-r'}`}>{record?.points || 'No Rec.'}</TableCell>
                                                </React.Fragment>
                                            )
                                        })}
                                    </TableRow>
                                );
                            })}
                            {summary.supervisors.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No data available for this period
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </Layout>
    );
}

export default WorkingDays;