import { Entity } from '@backstage/catalog-model';
import useAsync from 'react-use/lib/useAsync';
import { ExperimentRunsStats } from '../../types/ExperimentsRunStats';
import { PieChart } from '@mui/x-charts/PieChart';
import { Typography, makeStyles } from '@material-ui/core';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useApi } from '@backstage/core-plugin-api';
import { litmusApiRef } from '../../api';
import { ErrorPanel, Progress } from '@backstage/core-components';
import { LITMUS_PROJECT_ID, useLitmusAppData } from '../useLitmusAppData';
import React from 'react';

const useStyles = makeStyles(theme => ({
  label: {
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    fontSize: '10px',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  noExperimentRuns: {
    fontWeight: 'bold',
  },
}));

export const ExperimentRunStatsSection = ({ entity }: { entity: Entity }) => {
  const { projectID } = useLitmusAppData({ entity });
  const litmusApi = useApi(litmusApiRef);
  const classes = useStyles();
  const { value, loading, error } = useAsync(async (): Promise<
    ExperimentRunsStats | undefined
  > => {
    const experimentRunStats: Promise<ExperimentRunsStats | undefined> =
      litmusApi.getExperimentRunStats({
        projectID,
      });
    return experimentRunStats;
  }, [entity.metadata.annotations?.[LITMUS_PROJECT_ID]]);

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <ErrorPanel title={error.name} defaultExpanded error={error} />;
  }

  const total = value?.totalExperimentRuns ?? 0;
  const completed = value?.totalCompletedExperimentRuns ?? 0;
  const running = value?.totalRunningExperimentRuns ?? 0;
  const errored = value?.totalErroredExperimentRuns ?? 0;
  const stopped = value?.totalStoppedExperimentRuns ?? 0;
  const terminated = value?.totalTerminatedExperimentRuns?? 0;

  return (
    <Box>
      <Stack direction="column" spacing={2} width="100%" textAlign="center">
        <Box>
          <Typography align="center" className={classes.label}>
            Experiment Runs
          </Typography>
        </Box>
        {
          total === 0 ? (<Typography className={classes.noExperimentRuns}>There are no Chaos Experiments Runs in your project</Typography>):(<Box>
            <PieChart
              series={[
                {
                  data: [
                    {
                      value: completed,
                      color: '#4dc952',
                      label: 'Completed',
                    },
                    {
                      value: running,
                      color: '#5b43ba',
                      label: 'Running',
                    },
                    {
                      value: errored,
                      color: '#e43426',
                      label: 'Errored',
                    },
                    {
                      value: stopped,
                      color: '#d9d9d9',
                      label: 'Stopped',
                    },
                    {
                      value: terminated,
                      color: '#d9d9d9',
                      label: 'Terminated',
                    },
                  ],
                },
              ]}
              legend={{ hidden: true }}
              margin={{ right: 5 }}
              height={160}
            />
          </Box>)}
      </Stack>
    </Box>
  );
};
