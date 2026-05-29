import { ApiProperty } from '@nestjs/swagger';

class DashboardCardDto {
  @ApiProperty()
  label: string;
  @ApiProperty()
  value: number;
  @ApiProperty()
  icon: string;
  @ApiProperty()
  color: string;
}

class ChartItemDto {
  @ApiProperty()
  name: string;
  @ApiProperty()
  value: number;
}

class DashboardChartsDto {
  @ApiProperty({ type: [ChartItemDto] })
  moduleDistribution: ChartItemDto[];
  @ApiProperty({ type: [ChartItemDto] })
  statusDistribution: ChartItemDto[];
  @ApiProperty({ type: [ChartItemDto] })
  vocabularyStats: ChartItemDto[];
}

class ActivityItemDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  title: string;
  @ApiProperty()
  type: string;
  @ApiProperty()
  date: Date;
  @ApiProperty()
  user: string;
}

class ContributorDto {
  @ApiProperty()
  name: string;
  @ApiProperty({ required: false })
  role?: string;
  @ApiProperty()
  count: number;
}

export class DashboardStatsDto {
  @ApiProperty({ type: [DashboardCardDto] })
  cards: DashboardCardDto[];

  @ApiProperty({ type: DashboardChartsDto })
  charts: DashboardChartsDto;

  @ApiProperty({ type: [ActivityItemDto] })
  recentActivity: ActivityItemDto[];

  @ApiProperty({ type: [ContributorDto] })
  topContributors: ContributorDto[];

  @ApiProperty()
  summary: any;
}
