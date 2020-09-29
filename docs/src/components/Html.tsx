import { h, Component } from "zheleznaya";

export const Html = ({ html }: {html: string}) => {
  return (
    <div ref={el => el.innerHTML = html} />
  );
}
