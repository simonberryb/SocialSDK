package nsf.playground.snippets;

import nsf.playground.beans.GadgetSnippetBean;
import nsf.playground.beans.XPagesSnippetBean;
import lotus.domino.Database;
import lotus.domino.Document;

import com.ibm.sbt.playground.assets.AssetNode;
import com.ibm.sbt.playground.assets.NodeFactory;
import com.ibm.sbt.playground.assets.xpages.XPagesSnippet;
import com.ibm.sbt.playground.assets.xpages.XPagesSnippetNodeFactory;
import com.ibm.sbt.playground.vfs.VFSFile;

/**
 * Class for importing OpenSocial Gadget Snippets.
 * 
 * @author priand
 *
 */
public class GadgetSnippetImporter extends AssetImporter {
	
	public static final String TYPE = "gadget";
	public static final String FORM = GadgetSnippetBean.FORM;
	
	public GadgetSnippetImporter(Database db) {
		super(db);
	}
	
	protected String getAssetType() {
		return TYPE;
	}

	protected String getAssetForm() {
		return FORM;
	}

	protected NodeFactory getNodeFactory() {
		return new XPagesSnippetNodeFactory();
	}

	protected void saveAsset(ImportSource source, VFSFile root, AssetNode node) throws Exception {
		XPagesSnippet snippet = (XPagesSnippet)node.load(root);
		Document doc = getDatabase().createDocument();
		try {
			setItemValue(doc,"Form", FORM);
			setItemValue(doc,"Author", doc.getParentDatabase().getParent().getUserName()); // Should we make this private (reader field)?
			setItemValue(doc,"Id", node.getUnid());
			setItemValue(doc,"Category", node.getCategory());
			setItemValue(doc,"Name", node.getName());
			setItemValue(doc,"Description", snippet.getProperty("description"));
			setItemValue(doc,"Tags", snippet.getProperty("tags"));
			setItemValue(doc,"ImportSource", source.getName());
			setItemValueRichText(doc,"XPages", snippet.getXsp());
			setItemValueRichText(doc,"Properties", snippet.getPropertiesAsString());
			setItemValueRichText(doc,"Documentation", snippet.getDocHtml());
			
			doc.save();
		} finally {
			doc.recycle();
		}
	}
}
