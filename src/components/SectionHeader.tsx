type SectionHeaderProps = {
  title: string;
  // Eyebrows are rationed across the page (max one per three sections), so most
  // section headers ship without one.
  eyebrow?: string;
  description?: string;
};

export function SectionHeader({ title, eyebrow, description }: SectionHeaderProps) {
  return (
    <div className="section-header" data-reveal>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
      {description ? <p className="section-header__body">{description}</p> : null}
    </div>
  );
}
