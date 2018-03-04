import React from 'react';

const textToLines = (text) => {
  const lines = [];

  text.split('\n').forEach((line, i) => {
    lines.push(<span key={`line-${i}`}>{line}</span>);
    lines.push(<br key={`newline-${i}`} />);
  });
  lines.pop();

  return lines;
}

export default class MultilineText extends React.PureComponent {
  render() {
    const { text } = this.props;

    return <div>{textToLines(text)}</div>;
  }
}
