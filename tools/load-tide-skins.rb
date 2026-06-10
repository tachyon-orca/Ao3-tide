import_path = Rails.root.join("public/stylesheets/site/user_skins_to_load/ao3-tide.css")
author = User.find_by_login("lim") || User.first

raise "No author user found" unless author
raise "Missing #{import_path}" unless File.exist?(import_path)

blocks = File.read(import_path).split(%r{/\*\s*END SKIN\s*\*/}).map(&:strip).reject(&:blank?)
created = {}

blocks.each do |block|
  title = block[/\/\*\s*SKIN:\s*(.*?)\s*\*\//, 1]&.strip
  raise "Skin block without title:\n#{block[0, 200]}" unless title

  skin = Skin.find_or_initialize_by(title: title)
  skin.css = block
  skin.public = true
  skin.official = true
  skin.author ||= author
  skin.unusable = block.include?("PARENT_ONLY")
  skin.role ||= "user"

  skin.media =
    case title
    when / Tablet\z/
      ["only screen and (max-width: 62em)"]
    when / Phone\z/
      ["only screen and (max-width: 42em)"]
    else
      Skin::DEFAULT_MEDIA
    end

  skin.save!
  created[title] = skin
  puts "Saved #{title} (#{skin.id}) media=#{skin.get_media}"
end

blocks.each do |block|
  title = block[/\/\*\s*SKIN:\s*(.*?)\s*\*\//, 1]&.strip
  parents = block[/\/\*\s*PARENTS:\s*(.*?)\s*\*\//, 1]
  next unless title && parents

  child = Skin.find_by!(title: title)
  SkinParent.where(child_skin_id: child.id).delete_all

  parents.split(/,\s*/).each.with_index(1) do |parent_title, position|
    parent = Skin.find_by!(title: parent_title)
    SkinParent.create!(child_skin: child, parent_skin: parent, position: position)
    puts "Parent #{position} for #{title}: #{parent_title}"
  end
end
