import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  History, 
  X, 
  User, 
  Activity,
  ChevronDown,
  ChevronUp,
  Clock,
  UserPlus,
  UserMinus,
  Plus,
  Edit,
  Trash2,
  Move,
  Link,
  Unlink
} from "lucide-react";
import { 
  getRecentProjectActivities,
  type ProjectActivity 
} from "../api/projects";

interface HistoryOverviewProps {
  projectId: number;
}

const HistoryOverview: React.FC<HistoryOverviewProps> = ({ projectId }) => {
  const [showPanel, setShowPanel] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const { data: activities, isLoading, error } = useQuery<ProjectActivity[]>({
    queryKey: ["project-activities", projectId],
    queryFn: () => getRecentProjectActivities(projectId, 20),
    enabled: showPanel,
  });

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'TASK_CREATED':
      case 'TASK_UPDATED':
      case 'TASK_DELETED':
      case 'TASK_MOVED':
        return <Plus className="w-4 h-4" />;
      case 'LIST_CREATED':
      case 'LIST_UPDATED':
      case 'LIST_DELETED':
        return <Edit className="w-4 h-4" />;
      case 'COLLABORATOR_INVITED':
      case 'COLLABORATOR_JOINED':
        return <UserPlus className="w-4 h-4" />;
      case 'COLLABORATOR_LEFT':
        return <UserMinus className="w-4 h-4" />;
      case 'DEPENDENCY_ADDED':
        return <Link className="w-4 h-4" />;
      case 'DEPENDENCY_REMOVED':
        return <Unlink className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (activityType: string) => {
    if (activityType.includes('CREATED') || activityType.includes('JOINED') || activityType.includes('ADDED')) {
      return 'text-green-600 bg-green-50';
    }
    if (activityType.includes('UPDATED') || activityType.includes('MOVED')) {
      return 'text-blue-600 bg-blue-50';
    }
    if (activityType.includes('DELETED') || activityType.includes('LEFT') || activityType.includes('REMOVED')) {
      return 'text-red-600 bg-red-50';
    }
    return 'text-gray-600 bg-gray-50';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const formatDetailedTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };


  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="btn btn-primary btn-sm me-2"
        onClick={() => setShowPanel(true)}
      >
        <History size={16} className="me-2" />
        History
      </motion.button>

      {showPanel && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1050,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPanel(false);
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white border rounded shadow-lg p-4"
            style={{ maxWidth: "800px", width: "90%", maxHeight: "80vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">
                <History size={20} className="me-2" />
                Project History
              </h5>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowPanel(false)}
              >
                <X size={16} />
              </button>
            </div>


            {isLoading && (
              <div className="text-center py-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="alert alert-danger">
                Failed to load project history. Please try again.
              </div>
            )}

            {activities && activities.length === 0 && (
              <div className="text-center py-4 text-muted">
                <History size={48} className="mb-3 opacity-50" />
                <p>No activities found for this project.</p>
              </div>
            )}

            {activities && activities.length > 0 && (
              <div className="activity-list">
                {activities.map((activity) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="activity-item border-bottom py-3"
                  >
                    <div className="d-flex align-items-start">
                      <div className={`rounded-circle p-2 me-3 ${getActivityColor(activity.activityType)}`}>
                        {getActivityIcon(activity.activityType)}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <div className="fw-medium mb-1">
                              {activity.description}
                            </div>
                            <div className="text-muted small d-flex align-items-center">
                              <User size={12} className="me-1" />
                              {activity.username}
                              <Clock size={12} className="ms-2 me-1" />
                              {formatTimestamp(activity.timestamp)}
                            </div>
                          </div>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => toggleExpanded(activity.id)}
                          >
                            {expandedItems.has(activity.id) ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </button>
                        </div>
                        
                        {expandedItems.has(activity.id) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 p-3 bg-light rounded"
                          >
                            <div className="row">
                              <div className="col-md-6">
                                <strong>Activity Type:</strong>
                                <br />
                                <span className="text-muted">{activity.activityType}</span>
                              </div>
                              <div className="col-md-6">
                                <strong>Entity:</strong>
                                <br />
                                <span className="text-muted">
                                  {activity.entityType} {activity.entityId && `#${activity.entityId}`}
                                  {activity.entityName && ` - ${activity.entityName}`}
                                </span>
                              </div>
                              <div className="col-12 mt-2">
                                <strong>Timestamp:</strong>
                                <br />
                                <span className="text-muted">{formatDetailedTimestamp(activity.timestamp)}</span>
                              </div>
                              {activity.oldValues && (
                                <div className="col-md-6 mt-2">
                                  <strong>Previous Values:</strong>
                                  <br />
                                  <code className="small bg-white p-2 rounded d-block mt-1">
                                    {activity.oldValues}
                                  </code>
                                </div>
                              )}
                              {activity.newValues && (
                                <div className="col-md-6 mt-2">
                                  <strong>New Values:</strong>
                                  <br />
                                  <code className="small bg-white p-2 rounded d-block mt-1">
                                    {activity.newValues}
                                  </code>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </>
  );
};

export default HistoryOverview;
