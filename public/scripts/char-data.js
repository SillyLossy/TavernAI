class WorldInfoEntry {
	/**
	 * the id of the entry
	 * @type {number}
	 */
	id
	/**
	 * the keys of the entry
	 * @type {string[]}
	 */
	keys
	/**
	 * the secondary keys of the entry
	 * @type {string[]}
	 */
	secondary_keys
	/**
	 * the comment of the entry
	 * @type {string}
	 */
	comment
	/**
	 * the content of the entry
	 * @type {string}
	 */
	content
	/**
	 * is this entry a constant
	 * @type {boolean}
	 */
	constant
	/**
	 * is this entry case selective
	 * @type {boolean}
	 */
	selective
	/**
	 * the insertion order of the entry
	 * @type {number}
	 * @default 100
	 */
	insertion_order
	/**
	 * is this entry enabled
	 * @type {boolean}
	 * @default true
	 */
	enabled
	/**
	 * the position of the entry
	 * @type {"before_char" | "after_char" | string}
	 * @default "before_char"
	 */
	position
	/**
	 * the extension datas of the entry
	 */
	extensions = {
		/**
		 * the position of the entry
		 * @type {number}
		 * @default 0
		 */
		position,
		/**
		 * is this entry excluded from recursion
		 * @type {boolean}
		 * @default false
		 */
		exclude_recursion,
		/**
		 * the display index of the entry
		 * @type {number}
		 */
		display_index,
		/**
		 * the probability of the entry
		 * @type {number}
		 * @default 100
		 */
		probability,
		/**
		 * is the probability of the entry used
		 * @type {boolean}
		 * @default true
		 */
		useProbability,
		/**
		 * the depth of the entry
		 * @type {number}
		 * @default 4
		 */
		depth,
		/**
		 * the selective logic of the entry
		 * @type {number}
		 * @default 0
		 */
		selectiveLogic,
		/**
		 * the group of the entry
		 * @type {string}
		 */
		group,
		/**
		 * is the group override of the entry
		 * @type {boolean}
		 * @default false
		 */
		group_override,
		/**
		 * is the entry prevented from recursion
		 * @type {boolean}
		 * @default false
		 */
		prevent_recursion,
		/**
		 * the scan depth of the entry
		 * @type {number}
		 * @default null
		 */
		scan_depth,
		/**
		 * is the entry matched with whole words
		 * @type {boolean}
		 * @default null
		 */
		match_whole_words,
		/**
		 * is the entry case sensitive
		 * @type {boolean}
		 * @default null
		 */
		case_sensitive,
		/**
		 * the automation id of the entry
		 * @type {string}
		 */
		automation_id,
		/**
		 * the role of the entry
		 * @type {number}
		 * @default 0
		 */
		role,
		/**
		 * is the entry vectorized
		 * @type {boolean}
		 * @default false
		 */
		vectorized,
	}
}
class WorldInfoBook {
	/**
	 * the name of the book
	 * @type {string}
	 */
	name
	/**
	 * the entries of the book
	 * @type {WorldInfoEntry[]}
	 */
	entries
}
class v2CharData {
	/**
	 * the name of the character
	 * @type {string}
	 */
	name
	/**
	 * the description of the character
	 * @type {string}
	 */
	description
	/**
	 * character's version
	 * @type {string}
	 */
	character_version
	/**
	 * a short personality description of the character
	 * @type {string}
	 */
	personality
	/**
	 * a scenario description of the character
	 * @type {string}
	 */
	scenario
	/**
	 * the first message in the conversation
	 * @type {string}
	 */
	first_mes
	/**
	 * the example message in the conversation
	 * @type {string}
	 */
	mes_example
	/**
	 * creator's notes of the character
	 * @type {string}
	 */
	creator_notes
	/**
	 * the tags of the character
	 * @type {string[]}
	 */
	tags
	/**
	 * system_prompt override
	 * @type {string}
	 */
	system_prompt
	/**
	 * post_history_instructions
	 * @type {string}
	 */
	post_history_instructions
	/**
	 * creator's name
	 * @type {string}
	 */
	creator
	/**
	 * creator's name
	 * @type {string}
	 */
	create_by
	/**
	 * alternate_greetings for user choices
	 * @type {string[]}
	 */
	alternate_greetings
	/**
	 * extra data
	 */
	extensions = {
		/**
		 * talkativeness
		 * @type {number}
		 */
		talkativeness,
		/**
		 * fav
		 * @type {boolean}
		 */
		fav,
		/**
		 * world
		 * @type {string}
		 */
		world,
		/**
		 * depth_prompt
		 */
		depth_prompt: {
			/**
			 * depth
			 * @type {number}
			 */
			depth,
			/**
			 * prompt
			 * @type {string}
			 */
			prompt,
			/**
			 * role
			 * @type {"system" | "user" | "assistant"}
			 */
			role
		}
	}
	/**
	 * the charbook
	 * @type {WorldInfoBook}
	 */
	character_book
}
class v1CharData {
	/**
	 * the name of the character
	 * @type {string}
	 */
	name
	/**
	 * the description of the character
	 * @type {string}
	 */
	description
	/**
	 * a short personality description of the character
	 * @type {string}
	 */
	personality
	/**
	 * a scenario description of the character
	 * @type {string}
	 */
	scenario
	/**
	 * the first message in the conversation
	 * @type {string}
	 */
	first_mes
	/**
	 * the example message in the conversation
	 * @type {string}
	 */
	mes_example
	/**
	 * creator's notes of the character
	 * @type {string}
	 */
	creatorcomment
	/**
	 * the tags of the character
	 * @type {string[]}
	 */
	tags
	/**
	 * talkativeness
	 * @type {number}
	 */
	talkativeness
	/**
	 * fav
	 * @type {boolean}
	 */
	fav
	/**
	 * create_date
	 * @type {string}
	 */
	create_date
	/**
	 * v2 data extension
	 * @type {v2CharData}
	 */
	data
}
export { v2CharData, v1CharData, WorldInfoBook, WorldInfoEntry }
