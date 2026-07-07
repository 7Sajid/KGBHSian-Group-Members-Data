import React, { forwardRef } from 'react';

const Placeholder = ({ text = '—' }) => (
  <span className="id-placeholder">{text}</span>
);

// forwardRef so the parent can pass this DOM node to html2canvas
const MemberCard = forwardRef(function MemberCard({ data }, ref) {
  const { name, batch, blood, employment, location, phone } = data;

  return (
    <div className="id-card" ref={ref}>
      <div className="id-top">
        <div>
          <div className="id-org">Kishoreganj Govt Boys' High School</div>
          <div className="id-title">Member Card</div>
        </div>
        <div className="id-badge">
          <img src="/crest.png" alt="KGBHSian crest" />
        </div>
      </div>

      <div className="id-row">
        <span className="k">Name</span>
        <span className="v">{name || <Placeholder text="Your name" />}</span>
      </div>
      <div className="id-row">
        <span className="k">SSC Batch</span>
        <span className="v">{batch || <Placeholder />}</span>
      </div>
      <div className="id-row">
        <span className="k">Blood Group</span>
        <span className="v">{blood || <Placeholder />}</span>
      </div>
      <div className="id-row">
        <span className="k">Designation</span>
        <span className="v">{employment || <Placeholder />}</span>
      </div>
      <div className="id-row">
        <span className="k">Location</span>
        <span className="v">{location || <Placeholder />}</span>
      </div>
      <div className="id-row">
        <span className="k">Phone</span>
        <span className="v">{phone || <Placeholder />}</span>
      </div>

      <div className="id-footer">Issued on registration · KGBHSian Group Directory</div>
    </div>
  );
});

export default MemberCard;
