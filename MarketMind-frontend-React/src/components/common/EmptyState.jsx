import PropTypes from 'prop-types'

const EmptyState = ({ icon, title, description, actionText, onAction }) => {
  return (
    <div className="empty-state">
      <div className="icon">{icon}</div>
      <h4>{title}</h4>
      <p>{description}</p>
      {actionText && onAction && (
        <button onClick={onAction}>{actionText}</button>
      )}
    </div>
  )
}

EmptyState.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  actionText: PropTypes.string,
  onAction: PropTypes.func
}

export default EmptyState