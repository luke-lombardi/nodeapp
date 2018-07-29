import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import DatePicker from 'react-native-datepicker';

interface IProps {

}

interface IState {
    date: any;

}

export default class DateSelect extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
        date: new Date(),
    };
  }

  render() {
    return (
        <DatePicker
            style={styles.datePicker}
            date={this.state.date}
            mode='datetime'
            placeholder='select date'
            format='MMMM Do YYYY, h:mm:ss a'
            minDate={new Date()}
            maxDate={this.state.date + 90}
            confirmBtnText='Confirm'
            cancelBtnText='Cancel'
            customStyles={{
            dateIcon: {
                position: 'absolute',
                left: 0,
                top: 4,
                marginLeft: 0,
            },
            dateInput: {
                borderRadius: 10,
                marginLeft: 36,
            }}}
        onDateChange = { (date) => { this.setState({ date: date });
        }}
    />
        );
    }
}

const styles = StyleSheet.create({
    datePicker: {
        marginTop: 10,
        alignSelf: 'center',
        padding: 20,
        width: '100%',
        borderRadius: 10,
    },
});