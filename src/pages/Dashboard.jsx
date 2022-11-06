import { Navigate } from "react-router-dom";
import PropTypes from "prop-types"
import { connect } from 'react-redux'
import FileManager from "../components/FileManager";

const Dashboard = ({isAuthenticated, user}) => {

    return (
        <>
            {isAuthenticated ? 
                <div className="dashboard">
                    <div className="dashboard__user_info">{user.name}</div>
                    <FileManager/>
                </div>
            :
            <Navigate to="/" replace={true} />
            }
        </>
        
    )
}

Dashboard.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
    user: PropTypes.object,
}

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated,
    user: state.auth.user,
})

export default connect(mapStateToProps)(Dashboard)