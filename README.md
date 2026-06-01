# MMK

MMK is a turn-based online multiplayer game with gacha features.

## Setup

### Prerequisites

To host MMK, you must have the following backend services running on a server:

1. [Supabase](https://supabase.com), an open-source PostgreSQL development platform.

   > [!IMPORTANT]
   > You must set up your Supabase project in a specific way for MMK to work properly. Import the [schema](supabase-schema.sql) to instantly configure your PostgreSQL server.

2. [MMK Panel](https://github.com/v81d/mmk-panel), the official Django-based administration panel for MMK.

### Environment Variables

Create a `.env` file with the following content:

```
NUXT_PUBLIC_SUPABASE_URL=
NUXT_PUBLIC_SUPABASE_KEY=
NUXT_PUBLIC_AUTH_EMAIL_DOMAIN=mmk
NUXT_PUBLIC_MMK_PANEL_API=

NUXT_SUPABASE_SECRET_KEY=
```

Then, fill in the details with the data obtained from your server.

> [!NOTE]
> `NUXT_PUBLIC_AUTH_EMAIL_DOMAIN` can be set to mostly any alphanumerical string; it is used as the "domain" part of the fake email submitted to Supabase Auth when a user registers an account (e.g., "example@mmk"). Additionally, the key `NUXT_PUBLIC_MMK_PANEL_API` is the API endpoint URL that can be used to retrieve data from your MMK Django server.

### Development Server

To run MMK on a development server, follow the instructions:

1. Install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

2. Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

Now, the development server should be running. You can freely modify the code and deploy it as you wish, as long as you follow the guidelines outlined in the [license](LICENSE).

## Contributing

### Reporting Issues

To report an issue or bug, visit MMK's [issue tracker](https://github.com/v81d/mmk/issues) on GitHub.

### Translating the Project

You can contribute by adding translations for strings in the application. See [TRANSLATING.md](TRANSLATING.md) for more information.

### Pull Requests

To push your features or fixes into this official repository:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/my-feature`) or a fix branch (`git checkout -b fix/my-fix`).
3. Commit your changes (`git commit -m "feat: add new feature"`). **Please follow the [Conventional Commits](https://www.conventionalcommits.org) guideline when doing so!**
4. Push the branch (`git push origin feature/my-feature`).
5. Open a pull request with `contrib` as the base branch. Make sure to create a detailed title and description of your change.

Please follow the [GitHub flow](https://guides.github.com/introduction/flow) and the [GNOME Code of Conduct](CODE_OF_CONDUCT.md) when submitting a pull request.

## License

MMK is free software distributed under the **GNU General Public License, version 3.0 or later (GPL-3.0+).**

You are free to use, modify, and share the software under the terms of the GPL.
For full details, see the [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.html).
