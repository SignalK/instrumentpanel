var rb = require('react-bootstrap');
var React = require('react');
var _ = require('lodash');

var Table = rb.Table,
    tr = rb.tr,
    td =rb.td;



var DataItemList = React.createClass({
  getInitialState: function() {
    return {
      activeKey: 1
    }
  },
  render: function() {
    return (
      <div className="widgetlist">
      <Table striped bordered condensed hover>
      <tbody>
      {
          _.pairs(this.props.instrumentPanel.widgetsByPath).map(function(pair, i) {
            return <tr key={i}>
              <td>{pair[0]}</td>
              <td>{pair[1].getType()}</td>
              <td style={{"height":"16vh", "width":"16vw"}}>{pair[1].getReactElement()}</td>
            </tr> 
         })        
      }
      </tbody>
      </Table>  
      </div>  
    );
  },
  handleSelect: function(selectedKey) {
    this.setState({
      activeKey: selectedKey
    });
  }
});


module.exports = DataItemList;

