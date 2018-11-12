
export default class Utils {

  public static _validateFields(state: any, fields: any) {
    console.log('state is: ', state);
    console.log('fields are: ', fields);
    let errors = [];

    for (const field in fields) {
      if (fields.hasOwnProperty(field)) {
        let currRegex = fields[field];
        let inputToMatch = state[field].toString();
        let match = inputToMatch.match(new RegExp(currRegex));
        console.log(match, inputToMatch, currRegex);
        if (match === null) {
          errors.push(field);
        }
      }
    }

    return errors;
  }

}