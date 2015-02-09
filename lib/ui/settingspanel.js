var rb = require('react-bootstrap');
var React = require('react');

var TabbedArea = rb.TabbedArea,
    TabPane = rb.TabPane;

var DataItemList = require('./dataitemlist')
var WidgetList = require('./widgetlist')


var SettingsPanel = React.createClass({
  getInitialState: function() {
    return {
      activeKey: 1
    }
  },
  render: function() {
    return (
    <TabbedArea activeKey={this.state.activeKey} onSelect={this.handleSelect}>
      <TabPane eventKey={1} tab="By Display Widget">
        <WidgetList instrumentPanel={this.props.instrumentPanel}/>
      </TabPane>
      <TabPane eventKey={2} tab="By Data Item">
        <DataItemList instrumentPanel={this.props.instrumentPanel}/>
      </TabPane>
    </TabbedArea>
    );
  },
  handleSelect: function(selectedKey) {
    this.setState({
      activeKey: selectedKey
    });
  }
});


module.exports = SettingsPanel;

