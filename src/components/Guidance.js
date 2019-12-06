import React from "react";
import Markdown from 'react-markdown';

const Guidance = (props) => {
  const guidance = props.guidance;

  if (!guidance) return null;

  return <React.Fragment>
    {
      guidance.guidance.map(section => <React.Fragment>
        <h2>{ section.title }</h2>
        {section.guidance.map( subSection => <React.Fragment>
          <h3>{ subSection.title }</h3>
          <Markdown source={subSection.text}/>
        </React.Fragment>)}
      </React.Fragment>)
    }
  </React.Fragment>;
};

export default Guidance;
