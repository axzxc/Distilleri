export function createElement(...attr)
{
    const element = document.createElement(attr[0]);
    for (let i=1;i<attr.length;i++)
	{
		if (attr[i][0] == "innerHTML")
			element.innerHTML = attr[i][1];
		else
			element.setAttribute(attr[i][0],attr[i][1]);
	}
    return element;
}