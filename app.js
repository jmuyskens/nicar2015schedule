data = [];

saved = [];

function isSaved (obj) {
	for (var i = 0; i < saved.length; i++) {
		console.log(saved[i].link, obj.link, saved[i].link === obj.link);
		if (saved[i].link === obj.link) {
			return true;
		}
	}
	return false;
}

var Schedule = React.createClass({
	getInitialState: function() {
		return {eventList: data, isListAll: true, date:"2015-03-04"};
	},
	componentDidMount: function() {
		function loadCSVData (results) {
			results = results.map(function(result) {
				try {
					result.speakers = result.speakers.split("|");

				} catch(TypeError) {
					// do nothing;
				};

				return result;
			});
			data = results;
			this.setState({eventList: data});
		}
		loadCSVData = loadCSVData.bind(this);
		d3.csv("nicar15sched.csv", loadCSVData);
	},
	setDate: function(date) {
		this.setState({date: date});
	},
	toggleList: function(e) {
		e.preventDefault();
		if (this.state.isListAll) {
			this.setState({eventList: saved});
		} else {
			this.setState({eventList: data});
		}
		this.setState({isListAll: !this.state.isListAll});
	},
	render: function() {
		var allStatus = this.state.isListAll ? 'ownClass' : 'otherClass';
		var mineStatus = this.state.isListAll ? 'otherClass' : 'ownClass';
		var wed  = (this.state.date == "2015-03-04") ? 'ownClass' : 'otherClass';
		var thur = (this.state.date == "2015-03-05") ? 'ownClass' : 'otherClass';
		var fri  = (this.state.date == "2015-03-06") ? 'ownClass' : 'otherClass';
		var sat  = (this.state.date == "2015-03-07") ? 'ownClass' : 'otherClass';
		var sun  = (this.state.date == "2015-03-08") ? 'ownClass' : 'otherClass';
		return (
			<div className="schedule">
				<div className="head">
					<h1>Schedule</h1>
					<DateChoice date="2015-03-04" handler={this.setDate} dateclass={wed}>Wednesday</DateChoice> | <DateChoice date="2015-03-05" handler={this.setDate} dateclass={thur}>Thursday</DateChoice> | <DateChoice date="2015-03-06" handler={this.setDate} dateclass={fri}>Friday</DateChoice> | <DateChoice date="2015-03-07" handler={this.setDate} dateclass={sat}>Saturday</DateChoice> | <DateChoice date="2015-03-08" handler={this.setDate} dateclass={sun}>Sunday</DateChoice>
					<br />
					<a href="#" className={allStatus} onClick={this.toggleList}>All</a> | <a href="#" className={mineStatus} onClick={this.toggleList}>Mine</a>
				</div>
				<ScheduleTable data={this.state.eventList} date={this.state.date} />
			</div>
		);
	}
});

var DateChoice = React.createClass({
	handleClick: function(e) {
		e.preventDefault();
		this.props.handler(this.props.date);
	},
	render: function() {
		return (
			<a className={"dateChoice " + this.props.dateclass} onClick={this.handleClick} href="#">
				{this.props.children}
			</a>
		);
	}
})

var ScheduleTable = React.createClass({
	render: function() {
		var startTimes = _.chain(this.props.data)
			.filter({startDate: this.props.date})
			.sortBy(function(d) { return moment(d.startTime, "HH:mm a")._d; })
			.groupBy('startTime')
			.mapValues(function(events, time) {
				return (<StartTimeTable time={time} events={events} />);
			})
			.value();
		return (
			<div className="scheduleTable">
				{startTimes}
			</div>
		);
	}
});

var StartTimeTable = React.createClass({
	render: function() {
		events = this.props.events.map(function(d) {
			return (<ScheduleEvent data={d}/>);
		});
		return (
			<div className="startTimeTable cf">
				<h2 className="time">{this.props.time}</h2>
				<div className="events">
					{events}
				</div>
			</div>
		);
	}
});

var ScheduleEvent = React.createClass({
	getInitialState: function () {
		return {saved: isSaved(this.props.data), isDescriptionHidden: true};
	},
	save: function(e) {
		e.preventDefault();
		this.setState({saved: !this.state.saved});
		if (isSaved(this.props.data)) {
			console.log('removing');
			saved.splice(saved.indexOf(this.props.data), 1);
		} else {
			console.log('adding');
			saved.push(this.props.data);
		}
		console.log("saved", saved);
	},
	toggleDescription: function(e) {
		e.preventDefault();
		this.setState({isDescriptionHidden: !this.state.isDescriptionHidden});
	},
	render: function() {
		var savedText = this.state.saved ? 'Remove' : 'Save';
		var scheduleEventClasses = this.state.saved ? 'scheduleEvent saved' : 'scheduleEvent'
		var isDescriptionHiddenText = this.state.isDescriptionHidden ? 'Description': 'Hide';
		var hidden = this.state.isDescriptionHidden ? 'hidden canHide' : 'canHide';
		return (
			<div className={scheduleEventClasses}>
				<h3>{this.props.data.title}</h3>
				<Speakers list={this.props.data.speakers} />
				<p>Until <b>{this.props.data.endTime}</b> in <b>{this.props.data.location}</b></p>
				<p className={hidden}>{this.props.data.description}</p>
				<a onClick={this.toggleDescription} href="#">{isDescriptionHiddenText}</a> | <a href={this.props.data.link} target="_">Link</a> | <a onClick={this.save} href="#">{savedText}</a>
			</div>
		);
	}
});

var Speakers = React.createClass({
	render: function() {
		list = this.props.list.map(function(speaker, i, src) {
			if (src.length == 1 || (i + 2) == src.length) {
				return (<span><SpeakerLink name={speaker} /> </span>);
			} else if ((i + 1) == src.length) {
				return (<span>and <SpeakerLink name={speaker} /></span>);
			} else {
				return (<span><SpeakerLink name={speaker} />, </span>);
			}
		});
		return (
			<div className="speakers">
				<b>Speakers:</b> {list}
			</div>
		);
	}
});

var SpeakerLink = React.createClass({
	render: function() {
		return (<a className="speakerLink" href={"#" + this.props.name.replace(' ', '_')}>{this.props.name}</a>);
	}
})

React.render(
	<Schedule />,
	document.getElementById('content'));
