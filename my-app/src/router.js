import React, { Component } from 'react';
import { Router, Route, browserHistory } from 'react-router';
import { App, register, forget } from './App';
import sign from './sign';

class Routers extends Component {
    render(){        
			return( 
				<div className="outter">           
					<Router history={ browserHistory }>
						<Route path="/" component={App} />
                		<Route path="/register" component={register} />
						<Route path="/forget" component={forget} />
						<Route path="/sign" component={sign} />
          			</Router> 
				 </div>
        )
    }   
}
export default Routers;
