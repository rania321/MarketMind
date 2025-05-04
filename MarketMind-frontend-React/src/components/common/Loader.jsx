import PropTypes from 'prop-types'
import "../../styles/Loader.css"

const Loader = ({ fullHeight }) => {
  return (
    <div className={`loader-container ${fullHeight ? 'full-height' : ''}`}>
      <div className="loader-spinner"></div>
      <p>Loading products...</p>
    </div>
  )
}

Loader.propTypes = {
  fullHeight: PropTypes.bool
}

export default Loader