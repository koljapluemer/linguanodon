# Pages/

High level entry points for the app.
Made out of Vue components.
May depend on all the lower layers.
Ideally contains little business logic by itself.

Pages are what makes up websites and applications (also known as screens or activities). One page usually corresponds to one slice, however, if there are several very similar pages, they can be grouped into one slice, for example, registration and login forms.

There's no limit to how much code you can place in a page slice as long as your team still finds it easy to navigate. If a UI block on a page is not reused, it's perfectly fine to keep it inside the page slice.

In a page slice you can typically find the page's UI as well as loading states and error boundaries (📁 ui) and the data fetching and mutating requests (📁 api). It's not common for a page to have a dedicated data model, and tiny bits of state can be kept in the components themselves.