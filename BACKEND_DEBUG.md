# Local AO3 Backend Debug Notes

The adjacent backend checkout is expected at `../otwarchive`.

## Backend Setup

Initial Docker setup from the backend repo:

```sh
cd ../otwarchive
script/docker/init.sh
```

That script copies Docker config into `config/database.yml`,
`config/redis.yml`, and `config/local.yml`, starts MariaDB, Redis,
Elasticsearch, and memcached, then seeds the development database and loads the
official site skins.

After initial setup, start the development server with:

```sh
cd ../otwarchive
docker compose --profile dev up -d web
```

The site should be available at <http://localhost:3000/>.

## Load This Skin Into The Backend

Build the generated AO3 import file:

```sh
npm run build
```

Copy it into the backend's user skin loader directory:

```sh
cp dist/ao3-user-skins.css ../otwarchive/public/stylesheets/site/user_skins_to_load/ao3-tide.css
```

The current local backend rake loader has Ruby 3.4 incompatibilities in
`lib/tasks/skin_tasks.rake` (`File.exists?`) and can fail while attaching the
default preview. For local Tide debugging, copy and run the Rails loader script:

```sh
cp tools/load-tide-skins.rb ../otwarchive/tmp/load-tide-skins.rb
cd ../otwarchive
docker compose run --rm web bundle exec rails runner tmp/load-tide-skins.rb
```

The script imports the generated skin blocks through AO3's real `Skin` model,
sets the tablet/phone media values, and creates the Phone skin parent links.

To double-check the imported media values:

```sh
cd ../otwarchive
docker compose run --rm web bundle exec rails runner 'puts Skin.where("title LIKE ?", "AO3 Tide%").order(:id).pluck(:title, :media).map { |title, media| "#{title}: #{media.join(", ")}" }'
```

To find the local database ids for preview URLs:

```sh
cd ../otwarchive
docker compose run --rm web bundle exec rails runner 'puts Skin.where(title: ["AO3 Tide Dark Phone", "AO3 Tide Light Phone"]).pluck(:title, :id).map { |title, id| "#{title}: #{id}" }'
```

Preview any archive page with:

```text
http://localhost:3000/?site_skin=SKIN_ID
```

For later edits, rerun `npm run build`, copy `dist/ao3-user-skins.css` over
the backend loader file, and rerun `tmp/load-tide-skins.rb`.
