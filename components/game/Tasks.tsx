import React from 'react';
import './Tasks.css';

export type TaskType = 'daily' | 'game' | 'social';

export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  target: number;
  current: number;
  reward: number;
  rewardType: 'coins' | 'diamonds' | 'boost';
  claimed: boolean;
}

interface TasksProps {
  tasks: Task[];
  onClaim: (id: string) => void;
}

const getTaskIcon = (type: TaskType): string => {
  switch (type) {
    case 'daily':
      return '📅';
    case 'game':
      return '🎮';
    case 'social':
      return '📢';
    default:
      return '📋';
  }
};

const getRewardIcon = (rewardType: string): string => {
  switch (rewardType) {
    case 'coins':
      return '🪙';
    case 'diamonds':
      return '💎';
    case 'boost':
      return '⚡';
    default:
      return '🎁';
  }
};

const TaskCard: React.FC<{
  task: Task;
  onClaim: (id: string) => void;
  isClaimable: boolean;
}> = ({ task, onClaim, isClaimable }) => {
  const progressPercentage = Math.min((task.current / task.target) * 100, 100);
  const isCompleted = task.current >= task.target;

  return (
    <div
      className={`task-card ${isClaimable ? 'claimable' : ''} ${
        task.claimed ? 'claimed' : ''
      }`}
    >
      <div className="task-header">
        <span className="task-icon">{getTaskIcon(task.type)}</span>
        <div className="task-info">
          <h4 className="task-title">{task.title}</h4>
          <p className="task-description">{task.description}</p>
        </div>
        <div className="task-reward">
          <span className="reward-icon">{getRewardIcon(task.rewardType)}</span>
          <span className="reward-amount">+{task.reward}</span>
        </div>
      </div>

      {!task.claimed && (
        <div className="task-progress-section">
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="progress-text">
            {task.current.toLocaleString()} / {task.target.toLocaleString()}
          </span>
        </div>
      )}

      {task.claimed ? (
        <div className="task-status claimed">
          <span className="status-icon">✅</span>
          <span className="status-text">Completed</span>
        </div>
      ) : isClaimable ? (
        <button
          className="claim-button"
          onClick={() => onClaim(task.id)}
          disabled={task.claimed}
        >
          <span className="button-text">Claim Reward</span>
          <span className="button-icon">🎁</span>
        </button>
      ) : (
        <div className="task-status in-progress">
          <span className="status-icon">⏳</span>
          <span className="status-text">In Progress</span>
        </div>
      )}
    </div>
  );
};

export const Tasks: React.FC<TasksProps> = ({ tasks, onClaim }) => {
  const claimableTasks = tasks.filter(
    (task) => task.current >= task.target && !task.claimed
  );
  const inProgressTasks = tasks.filter(
    (task) => task.current < task.target && !task.claimed
  );
  const completedTasks = tasks.filter((task) => task.claimed);

  return (
    <div className="tasks-container">
      <h2 className="tasks-title">🎯 Tasks & Missions</h2>

      {claimableTasks.length > 0 && (
        <section className="tasks-section claimable-section">
          <h3 className="section-title">
            <span className="section-icon">🎁</span>
            Ready to Claim
            <span className="badge">{claimableTasks.length}</span>
          </h3>
          <div className="tasks-list">
            {claimableTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClaim={onClaim}
                isClaimable={true}
              />
            ))}
          </div>
        </section>
      )}

      {inProgressTasks.length > 0 && (
        <section className="tasks-section">
          <h3 className="section-title">
            <span className="section-icon">🚀</span>
            In Progress
          </h3>
          <div className="tasks-list">
            {inProgressTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClaim={onClaim}
                isClaimable={false}
              />
            ))}
          </div>
        </section>
      )}

      {completedTasks.length > 0 && (
        <section className="tasks-section completed-section">
          <h3 className="section-title">
            <span className="section-icon">✅</span>
            Completed
            <span className="badge completed">{completedTasks.length}</span>
          </h3>
          <div className="tasks-list">
            {completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClaim={onClaim}
                isClaimable={false}
              />
            ))}
          </div>
        </section>
      )}

      {tasks.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <p className="empty-text">No tasks available right now.</p>
          <p className="empty-subtext">Check back later for new missions!</p>
        </div>
      )}
    </div>
  );
};

export default Tasks;
